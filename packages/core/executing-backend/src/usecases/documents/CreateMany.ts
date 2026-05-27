import type {
  Backend,
  CollectionNotFound,
  ConversationId,
  Document,
  DocumentContentNotValid,
  DocumentDefinition,
  DocumentId,
  DocumentVersionCreator,
  DuplicateDocumentDetected,
  FilesNotFound,
  MakingContentBlockingKeysFailed,
  ReferencedDocumentsNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import {
  extractProtoDocumentIds,
  makeProtoDocumentIdMapping,
  replaceProtoDocumentIdsAndProtoCollectionIds,
} from "../../utils/ProtoIdUtils.js";
import DocumentsCreate from "./Create.js";

interface DocumentsCreateManyOptions {
  createdBy?: DocumentVersionCreator.Assistant;
  conversationId?: ConversationId;
  documentIds?: DocumentId[];
}

export default class DocumentsCreateMany extends BackendUsecase<
  Backend["documents"]["createMany"]
> {
  argumentsSchema = v.tuple([
    v.array(structuralSchemas.backend.types.documentDefinition()),
  ]);
  resultSchema = structuralSchemas.global.result(
    v.array(structuralSchemas.backend.types.document()),
    [
      structuralSchemas.backend.errors.collectionNotFound(),
      structuralSchemas.backend.errors.documentContentNotValid(),
      structuralSchemas.backend.errors.duplicateDocumentDetected(),
      structuralSchemas.backend.errors.filesNotFound(),
      structuralSchemas.backend.errors.makingContentBlockingKeysFailed(),
      structuralSchemas.backend.errors.referencedDocumentsNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    definitions: DocumentDefinition[],
    options?: DocumentsCreateManyOptions,
  ): ResultPromise<
    Document[],
    | CollectionNotFound
    | DocumentContentNotValid
    | FilesNotFound
    | ReferencedDocumentsNotFound
    | MakingContentBlockingKeysFailed
    | DuplicateDocumentDetected
    | UnexpectedError
  > {
    const documentIds =
      options?.documentIds ?? definitions.map(() => Id.generate.document());
    const idMapping = makeProtoDocumentIdMapping(documentIds);

    const documentsCreate = this.sub(DocumentsCreate);
    const createdDocuments: Document[] = [];

    for (const [index, definition] of definitions.entries()) {
      const { collectionId, content, options: definitionOptions } = definition;
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

      // Validate references to proto documents.
      const notFoundProtoDocumentIds = extractProtoDocumentIds(
        latestCollectionVersion.schema,
        content,
      ).difference(idMapping);
      if (notFoundProtoDocumentIds.size > 0) {
        return makeUnsuccessfulResult(
          makeResultError("ReferencedDocumentsNotFound", {
            collectionId,
            documentId: null,
            notFoundDocumentRefs: [...notFoundProtoDocumentIds].map(
              (protoDocumentId) => ({
                collectionId: collectionId,
                documentId: protoDocumentId,
              }),
            ),
          }),
        );
      }

      const resolvedContent = replaceProtoDocumentIdsAndProtoCollectionIds(
        latestCollectionVersion.schema,
        content,
        idMapping,
      );

      const createResult = await documentsCreate.exec(
        {
          collectionId,
          content: resolvedContent,
          options: definitionOptions,
        },
        {
          documentId: documentId as DocumentId,
          skipReferenceCheckForDocumentIds: documentIds,
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
