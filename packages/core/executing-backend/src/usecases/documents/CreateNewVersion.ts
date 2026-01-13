import {
  type Backend,
  type CollectionId,
  type CollectionNotFound,
  type ConnectorDoesNotSupportUpSyncing,
  type ConversationId,
  type Document,
  type DocumentContentNotValid,
  type DocumentId,
  type DocumentNotFound,
  DocumentVersionCreator,
  type DocumentVersionId,
  type DocumentVersionIdNotMatching,
  type FilesNotFound,
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
import makeDocument from "../../makers/makeDocument.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import ContentDocumentRefUtils from "../../utils/ContentDocumentRefUtils.js";
import ContentFileUtils from "../../utils/ContentFileUtils.js";
import difference from "../../utils/difference.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";

type ExecReturnValue = ResultPromise<
  Document,
  | CollectionNotFound
  | DocumentNotFound
  | ConnectorDoesNotSupportUpSyncing
  | DocumentVersionIdNotMatching
  | DocumentContentNotValid
  | FilesNotFound
  | ReferencedDocumentsNotFound
  | UnexpectedError
>;
export default class DocumentsCreateNewVersion extends Usecase<
  Backend["documents"]["createNewVersion"]
> {
  async exec(
    collectionId: CollectionId,
    id: DocumentId,
    latestVersionId: DocumentVersionId,
    content: any,
  ): ExecReturnValue;
  async exec(
    collectionId: CollectionId,
    id: DocumentId,
    latestVersionId: DocumentVersionId,
    content: any,
    options:
      | {
          createdBy: DocumentVersionCreator.Assistant;
          conversationId: ConversationId;
        }
      | {
          createdBy: DocumentVersionCreator.Migration;
          remoteVersionId: string | null;
        }
      | {
          createdBy: DocumentVersionCreator.Connector;
          remoteVersionId: string;
          remoteUrl: string | null;
          remoteDocument: any;
        },
  ): ExecReturnValue;
  async exec(
    collectionId: CollectionId,
    id: DocumentId,
    latestVersionId: DocumentVersionId,
    content: any,
    options?: {
      createdBy:
        | DocumentVersionCreator.Assistant
        | DocumentVersionCreator.Migration
        | DocumentVersionCreator.Connector;
      conversationId?: ConversationId;
      remoteVersionId?: string | null;
      remoteUrl?: string | null;
      remoteDocument?: any;
    },
  ): ExecReturnValue {
    const collection = await this.repos.collection.find(collectionId);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId }),
      );
    }

    const document = await this.repos.document.find(id);
    if (!document || document.collectionId !== collectionId) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentNotFound", { documentId: id }),
      );
    }

    if (
      // Right now no connector supports up-syncing, so checking if the
      // collection has a remote is sufficient. TODO: update condition once
      // connectors support up-syncing.
      collection.remote !== null &&
      options?.createdBy !== DocumentVersionCreator.Connector &&
      options?.createdBy !== DocumentVersionCreator.Migration
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

    const latestVersion =
      await this.repos.documentVersion.findLatestWhereDocumentIdEq(id);
    assertDocumentVersionExists(document.collectionId, id, latestVersion);

    if (latestVersionId !== latestVersion.id) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentVersionIdNotMatching", {
          documentId: id,
          latestVersionId: latestVersion.id,
          suppliedVersionId: latestVersionId,
        }),
      );
    }

    const latestCollectionVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(
        document.collectionId,
      );
    assertCollectionVersionExists(
      document.collectionId,
      latestCollectionVersion,
    );

    const contentValidationResult = v.safeParse(
      valibotSchemas.content(latestCollectionVersion.schema),
      content,
    );
    if (!contentValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentContentNotValid", {
          collectionId: document.collectionId,
          collectionVersionId: latestCollectionVersion.id,
          documentId: id,
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
          collectionId: document.collectionId,
          documentId: id,
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

    const now = new Date();
    const { convertedContent, protoFilesWithIds } =
      ContentFileUtils.extractAndConvertProtoFiles(
        latestCollectionVersion.schema,
        contentValidationResult.output,
      );
    const documentVersion: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      remoteId: options?.remoteVersionId ?? null,
      previousVersionId: latestVersionId,
      documentId: id,
      collectionId: document.collectionId,
      collectionVersionId: latestCollectionVersion.id,
      conversationId: options?.conversationId ?? null,
      content: convertedContent,
      referencedDocuments: referencedDocuments,
      createdBy: options?.createdBy ?? DocumentVersionCreator.User,
      createdAt: now,
    } as DocumentVersionEntity;
    const textChunks = utils.extractTextChunks(
      latestCollectionVersion.schema,
      convertedContent,
    );
    const filesWithContent: (FileEntity & {
      content: Uint8Array<ArrayBuffer>;
    })[] = protoFilesWithIds.map((protoFileWithId) => ({
      id: protoFileWithId.id,
      referencedBy: [
        {
          collectionId: collectionId,
          documentId: id,
          documentVersionId: documentVersion.id,
        },
      ],
      createdAt: now,
      content: protoFileWithId.content,
    }));
    if (options?.createdBy === DocumentVersionCreator.Connector) {
      const updatedDocument: DocumentEntity = {
        ...document,
        // TypeScript doesn't understand, but if createdBy === Connector, then
        // options.remoteUrl is not undefined.
        // @ts-expect-error
        remoteUrl: options.remoteUrl,
        latestRemoteDocument: options.remoteDocument,
      };
      await this.repos.document.replace(updatedDocument);
    }
    await this.repos.documentVersion.insert(documentVersion);
    await this.repos.documentTextSearchIndex.upsert(
      collectionId,
      id,
      textChunks,
    );
    await this.repos.file.addReferenceToAll(referencedFileIds, {
      collectionId: collectionId,
      documentId: id,
      documentVersionId: documentVersion.id,
    });
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
