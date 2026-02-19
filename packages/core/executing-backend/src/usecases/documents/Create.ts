import {
  type Backend,
  type CollectionNotFound,
  type ConnectorDoesNotSupportUpSyncing,
  type ConversationId,
  type Document,
  type DocumentContentNotValid,
  type DocumentDefinition,
  type DocumentId,
  DocumentVersionCreator,
  type DuplicateDocumentDetected,
  type FilesNotFound,
  type MakingContentBlockingKeysFailed,
  type ReferencedDocumentsNotFound,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { type DocumentRef, utils, valibotSchemas } from "@superego/schema";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import type DocumentEntity from "../../entities/DocumentEntity.js";
import type DocumentVersionEntity from "../../entities/DocumentVersionEntity.js";
import type FileEntity from "../../entities/FileEntity.js";
import makeContentBlockingKeys from "../../makers/makeContentBlockingKeys.js";
import makeContentSummary from "../../makers/makeContentSummary.js";
import makeDocument from "../../makers/makeDocument.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import * as argSchemas from "../../utils/argSchemas.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import assertDocumentExists from "../../utils/assertDocumentExists.js";
import ContentDocumentRefUtils from "../../utils/ContentDocumentRefUtils.js";
import ContentFileUtils from "../../utils/ContentFileUtils.js";
import difference from "../../utils/difference.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

type ExecReturnValue = ResultPromise<
  Document,
  | CollectionNotFound
  | ConnectorDoesNotSupportUpSyncing
  | DocumentContentNotValid
  | FilesNotFound
  | ReferencedDocumentsNotFound
  | MakingContentBlockingKeysFailed
  | DuplicateDocumentDetected
  | UnexpectedError
>;
export default class DocumentsCreate extends Usecase<
  Backend["documents"]["create"]
> {
  async exec(
    definition: DocumentDefinition,
    options?: {
      documentId?: DocumentId;
      skipReferenceCheckForDocumentIds?: DocumentId[];
    },
  ): ExecReturnValue;
  async exec(
    definition: DocumentDefinition,
    options:
      | {
          createdBy: DocumentVersionCreator.Assistant;
          conversationId: ConversationId;
          documentId?: DocumentId;
          skipReferenceCheckForDocumentIds?: DocumentId[];
        }
      | {
          createdBy: DocumentVersionCreator.Connector;
          remoteId: string;
          remoteVersionId: string;
          remoteUrl: string | null;
          remoteDocument: any;
        },
  ): ExecReturnValue;
  @validateArgs([argSchemas.documentDefinition(), v.looseObject({})])
  async exec(
    definition: DocumentDefinition,
    options: {
      createdBy?:
        | DocumentVersionCreator.Assistant
        | DocumentVersionCreator.Connector;
      conversationId?: ConversationId;
      remoteId?: string;
      remoteVersionId?: string;
      remoteUrl?: string | null;
      remoteDocument?: any;
      documentId?: DocumentId;
      skipReferenceCheckForDocumentIds?: DocumentId[];
    } = {},
  ): ExecReturnValue {
    const { collectionId, content } = definition;
    const { skipDuplicateCheck } = definition.options ?? {
      skipDuplicateCheck: false,
    };
    const collection = await this.repos.collection.find(collectionId);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId }),
      );
    }

    if (
      // Right now no connector supports up-syncing, so checking if the
      // collection has a remote is sufficient. TODO: update condition once
      // connectors support up-syncing.
      collection.remote !== null &&
      options.createdBy !== DocumentVersionCreator.Connector
    ) {
      return makeUnsuccessfulResult(
        makeResultError("ConnectorDoesNotSupportUpSyncing", {
          collectionId: collectionId,
          connectorName: collection.remote.connector.name,
          message:
            "The collection has a remote, and its connector does not support up-syncing. This effectively makes the collection read-only.",
        }),
      );
    }

    const latestCollectionVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(
        collectionId,
      );
    assertCollectionVersionExists(collectionId, latestCollectionVersion);

    const contentValidationResult = v.safeParse(
      valibotSchemas.content(latestCollectionVersion.schema),
      content,
    );
    if (!contentValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentContentNotValid", {
          collectionId,
          collectionVersionId: latestCollectionVersion.id,
          documentId: null,
          issues: makeValidationIssues(contentValidationResult.issues),
        }),
      );
    }

    const referencedDocuments = ContentDocumentRefUtils.extractDocumentRefs(
      latestCollectionVersion.schema,
      contentValidationResult.output,
    );
    const notFoundDocumentRefs: DocumentRef[] = [];
    for (const referencedDocument of referencedDocuments) {
      if (
        !options.skipReferenceCheckForDocumentIds?.includes(
          referencedDocument.documentId as DocumentId,
        ) &&
        !(await this.repos.document.exists(
          referencedDocument.documentId as DocumentId,
        ))
      ) {
        notFoundDocumentRefs.push(referencedDocument);
      }
    }
    if (!isEmpty(notFoundDocumentRefs)) {
      return makeUnsuccessfulResult(
        makeResultError("ReferencedDocumentsNotFound", {
          collectionId,
          documentId: null,
          notFoundDocumentRefs,
        }),
      );
    }

    const referencedFileIds = ContentFileUtils.extractReferencedFileIds(
      latestCollectionVersion.schema,
      contentValidationResult.output,
    );
    const referencedFiles =
      await this.repos.file.findAllWhereIdIn(referencedFileIds);
    const missingFileIds = difference(
      referencedFileIds,
      referencedFiles.map(({ id }) => id),
    );
    if (!isEmpty(missingFileIds)) {
      return makeUnsuccessfulResult(
        makeResultError("FilesNotFound", { fileIds: missingFileIds }),
      );
    }

    let contentBlockingKeys: string[] | null = null;
    if (latestCollectionVersion.settings.contentBlockingKeysGetter !== null) {
      const makeContentBlockingKeysResult = await makeContentBlockingKeys(
        this.javascriptSandbox,
        latestCollectionVersion,
        null,
        contentValidationResult.output,
      );
      if (!makeContentBlockingKeysResult.success) {
        return makeContentBlockingKeysResult;
      }
      contentBlockingKeys = makeContentBlockingKeysResult.data;
    }

    if (
      contentBlockingKeys !== null &&
      !isEmpty(contentBlockingKeys) &&
      !skipDuplicateCheck
    ) {
      const duplicateDocumentVersion =
        await this.repos.documentVersion.findAnyLatestWhereCollectionIdEqAndContentBlockingKeysOverlap(
          collectionId,
          contentBlockingKeys,
        );
      if (duplicateDocumentVersion) {
        const duplicateDocument = await this.repos.document.find(
          duplicateDocumentVersion.documentId,
        );
        assertDocumentExists(
          collectionId,
          duplicateDocumentVersion.documentId,
          duplicateDocument,
        );
        return makeUnsuccessfulResult(
          makeResultError("DuplicateDocumentDetected", {
            collectionId,
            duplicateDocument: makeDocument(
              duplicateDocument,
              duplicateDocumentVersion,
            ),
          }),
        );
      }
    }

    const now = new Date();
    // TypeScript doesn't understand that if remoteId is not null all other
    // remote* properties are not null.
    // @ts-expect-error
    const document: DocumentEntity = {
      id: options.documentId ?? Id.generate.document(),
      remoteId: options.remoteId ?? null,
      remoteUrl: options.remoteUrl ?? null,
      latestRemoteDocument: options.remoteDocument ?? null,
      collectionId: collectionId,
      createdAt: now,
    };
    const { protoFilesWithIds, convertedContent } =
      ContentFileUtils.extractAndConvertProtoFiles(
        latestCollectionVersion.schema,
        contentValidationResult.output,
      );
    const documentVersionId = Id.generate.documentVersion();
    const contentSummary = await makeContentSummary(
      this.javascriptSandbox,
      latestCollectionVersion,
      {
        id: documentVersionId,
        documentId: document.id,
        content: convertedContent,
      },
    );
    const documentVersion: DocumentVersionEntity = {
      id: documentVersionId,
      remoteId: options.remoteVersionId ?? null,
      previousVersionId: null,
      documentId: document.id,
      collectionId: collectionId,
      collectionVersionId: latestCollectionVersion.id,
      conversationId: options.conversationId ?? null,
      content: convertedContent,
      contentBlockingKeys: contentBlockingKeys,
      referencedDocuments: referencedDocuments,
      contentSummary: contentSummary,
      createdBy: options.createdBy ?? DocumentVersionCreator.User,
      createdAt: now,
    };
    const textChunks = utils.extractTextChunks(
      latestCollectionVersion.schema,
      convertedContent,
    );
    const documentVersionReference: FileEntity.DocumentVersionReference = {
      collectionId: collectionId,
      documentId: document.id,
      documentVersionId: documentVersion.id,
    };
    const filesWithContent: (FileEntity & {
      content: Uint8Array<ArrayBuffer>;
    })[] = protoFilesWithIds.map((protoFileWithId) => ({
      id: protoFileWithId.id,
      referencedBy: [documentVersionReference],
      createdAt: now,
      content: protoFileWithId.content,
    }));

    await this.repos.document.insert(document);
    await this.repos.documentVersion.insert(documentVersion);
    await this.repos.documentTextSearchIndex.upsert(
      collectionId,
      document.id,
      textChunks,
    );
    await this.repos.file.addReferenceToAll(
      referencedFileIds,
      documentVersionReference,
    );
    await this.repos.file.insertAll(filesWithContent);

    return makeSuccessfulResult(makeDocument(document, documentVersion));
  }
}
