import {
  type Backend,
  type CollectionId,
  type CollectionNotFound,
  type ConnectorDoesNotSupportUpSyncing,
  type ConversationId,
  type Document,
  type DocumentContentNotValid,
  type DocumentId,
  DocumentVersionCreator,
  type DuplicateDocumentDetected,
  type FilesNotFound,
  type MakingContentFingerprintFailed,
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
import makeContentFingerprint from "../../makers/makeContentFingerprint.js";
import makeDocument from "../../makers/makeDocument.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import ContentDocumentRefUtils from "../../utils/ContentDocumentRefUtils.js";
import ContentFileUtils from "../../utils/ContentFileUtils.js";
import difference from "../../utils/difference.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";

type ExecReturnValue = ResultPromise<
  Document,
  | CollectionNotFound
  | ConnectorDoesNotSupportUpSyncing
  | DocumentContentNotValid
  | FilesNotFound
  | ReferencedDocumentsNotFound
  | MakingContentFingerprintFailed
  | DuplicateDocumentDetected
  | UnexpectedError
>;
export default class DocumentsCreate extends Usecase<
  Backend["documents"]["create"]
> {
  async exec(
    collectionId: CollectionId,
    content: any,
    options?: { skipDuplicateCheck: boolean },
  ): ExecReturnValue;
  async exec(
    collectionId: CollectionId,
    content: any,
    options:
      | {
          createdBy: DocumentVersionCreator.Assistant;
          conversationId: ConversationId;
          skipDuplicateCheck: boolean;
        }
      | {
          createdBy: DocumentVersionCreator.Connector;
          remoteId: string;
          remoteVersionId: string;
          remoteUrl: string | null;
          remoteDocument: any;
          skipDuplicateCheck: true;
        },
  ): ExecReturnValue;
  async exec(
    collectionId: CollectionId,
    content: any,
    options: {
      createdBy?:
        | DocumentVersionCreator.Assistant
        | DocumentVersionCreator.Connector;
      conversationId?: ConversationId;
      remoteId?: string;
      remoteVersionId?: string;
      remoteUrl?: string | null;
      remoteDocument?: any;
      skipDuplicateCheck: boolean;
    } = { skipDuplicateCheck: false },
  ): ExecReturnValue {
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
      const exists = await this.repos.document.exists(
        referencedDocument.documentId as DocumentId,
      );
      if (!exists) {
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

    let contentFingerprint: string | null = null;
    if (latestCollectionVersion.settings.contentFingerprintGetter !== null) {
      const makeContentFingerprintResult = await makeContentFingerprint(
        this.javascriptSandbox,
        latestCollectionVersion,
        null,
        contentValidationResult.output,
      );
      if (!makeContentFingerprintResult.success) {
        return makeContentFingerprintResult;
      }
      contentFingerprint = makeContentFingerprintResult.data;
    }

    if (contentFingerprint !== null && !options.skipDuplicateCheck) {
      const duplicateDocumentVersion =
        await this.repos.documentVersion.findAnyLatestByContentFingerprint(
          collectionId,
          contentFingerprint,
        );
      if (duplicateDocumentVersion) {
        return makeUnsuccessfulResult(
          makeResultError("DuplicateDocumentDetected", {
            collectionId,
            existingDocumentId: duplicateDocumentVersion.documentId,
            contentFingerprint,
          }),
        );
      }
    }

    const now = new Date();
    // TypeScript doesn't understand that if remoteId is not null all other
    // remote* properties are not null.
    // @ts-expect-error
    const document: DocumentEntity = {
      id: Id.generate.document(),
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
    const documentVersion: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      remoteId: options.remoteVersionId ?? null,
      previousVersionId: null,
      documentId: document.id,
      collectionId: collectionId,
      collectionVersionId: latestCollectionVersion.id,
      conversationId: options.conversationId ?? null,
      content: convertedContent,
      contentFingerprint: contentFingerprint,
      referencedDocuments: referencedDocuments,
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

    return makeSuccessfulResult(
      await makeDocument(
        this.javascriptSandbox,
        latestCollectionVersion,
        document,
        documentVersion,
      ),
    );
  }
}
