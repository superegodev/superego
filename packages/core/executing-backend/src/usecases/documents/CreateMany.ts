import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  ConnectorDoesNotSupportUpSyncing,
  ConversationId,
  Document,
  DocumentContentNotValid,
  DocumentId,
  DocumentVersionCreator,
  DuplicateDocumentDetected,
  FilesNotFound,
  MakingContentBlockingKeysFailed,
  ReferencedDocumentsNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { utils as schemaUtils } from "@superego/schema";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";
import DocumentsCreate from "./Create.js";

interface DocumentsCreateManyOptions {
  createdBy?: DocumentVersionCreator.Assistant;
  conversationId?: ConversationId;
}

export default class DocumentsCreateMany extends Usecase<
  Backend["documents"]["createMany"]
> {
  async exec(
    documents: {
      collectionId: CollectionId;
      content: any;
      options?: { skipDuplicateCheck: boolean };
    }[],
    options?: DocumentsCreateManyOptions,
  ): ResultPromise<
    Document[],
    | CollectionNotFound
    | ConnectorDoesNotSupportUpSyncing
    | DocumentContentNotValid
    | FilesNotFound
    | ReferencedDocumentsNotFound
    | MakingContentBlockingKeysFailed
    | DuplicateDocumentDetected
    | UnexpectedError
  > {
    const documentIds = documents.map(() => Id.generate.document());
    const idMapping = schemaUtils.makeProtoDocumentIdMapping(documentIds);

    const documentsCreate = this.sub(DocumentsCreate);
    const createdDocuments: Document[] = [];

    for (const [index, document] of documents.entries()) {
      const { collectionId, content, options: documentOptions } = document;
      const documentId = documentIds[index];

      const collection = await this.repos.collection.find(collectionId);
      if (!collection) {
        return makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", { collectionId }),
        );
      }

      const latestCollectionVersion =
        await this.repos.collectionVersion.findLatestWhereCollectionIdEq(
          collectionId,
        );
      assertCollectionVersionExists(collectionId, latestCollectionVersion);

      const protoDocumentIds = schemaUtils.extractProtoDocumentIds(
        latestCollectionVersion.schema,
        content,
      );

      // Validate references to proto documents.
      const notFoundProtoDocumentIds = protoDocumentIds.filter(
        (id) => !idMapping.has(id),
      );
      if (notFoundProtoDocumentIds.length > 0) {
        return makeUnsuccessfulResult(
          makeResultError("ReferencedDocumentsNotFound", {
            collectionId,
            documentId: null,
            notFoundDocumentRefs: notFoundProtoDocumentIds.map((protoId) => ({
              collectionId: collectionId,
              documentId: protoId,
            })),
          }),
        );
      }

      const resolvedContent = schemaUtils.replaceProtoDocumentIds(
        latestCollectionVersion.schema,
        content,
        idMapping,
      );

      const createResult = await documentsCreate.exec(
        collectionId,
        resolvedContent,
        {
          skipDuplicateCheck: documentOptions?.skipDuplicateCheck ?? false,
          documentId: documentId as DocumentId,
          allowedUnverifiedDocumentIds: documentIds as DocumentId[],
          ...(options?.createdBy && options?.conversationId
            ? {
                createdBy: options.createdBy,
                conversationId: options.conversationId,
              }
            : null),
        },
      );

      if (createResult.error) {
        return makeUnsuccessfulResult(createResult.error);
      }

      createdDocuments.push(createResult.data);
    }

    return makeSuccessfulResult(createdDocuments);
  }
}
