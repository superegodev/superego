import * as v from "valibot";
import ArgumentsNotValidSchema from "../../errors/ArgumentsNotValid.js";
import CollectionNotFoundSchema from "../../errors/CollectionNotFound.js";
import CommandConfirmationNotValidSchema from "../../errors/CommandConfirmationNotValid.js";
import ConnectorDoesNotSupportUpSyncingSchema from "../../errors/ConnectorDoesNotSupportUpSyncing.js";
import DocumentContentNotValidSchema from "../../errors/DocumentContentNotValid.js";
import DocumentIsReferencedSchema from "../../errors/DocumentIsReferenced.js";
import DocumentNotFoundSchema from "../../errors/DocumentNotFound.js";
import DocumentVersionIdNotMatchingSchema from "../../errors/DocumentVersionIdNotMatching.js";
import DocumentVersionNotFoundSchema from "../../errors/DocumentVersionNotFound.js";
import DuplicateDocumentDetectedSchema from "../../errors/DuplicateDocumentDetected.js";
import FilesNotFoundSchema from "../../errors/FilesNotFound.js";
import MakingContentBlockingKeysFailedSchema from "../../errors/MakingContentBlockingKeysFailed.js";
import ReferencedDocumentsNotFoundSchema from "../../errors/ReferencedDocumentsNotFound.js";
import UnexpectedErrorSchema from "../../errors/UnexpectedError.js";
import CollectionIdSchema from "../../ids/CollectionId.js";
import DocumentIdSchema from "../../ids/DocumentId.js";
import DocumentVersionIdSchema from "../../ids/DocumentVersionId.js";
import DocumentSchema from "../../types/Document.js";
import DocumentDefinitionSchema from "../../types/DocumentDefinition.js";
import DocumentVersionSchema from "../../types/DocumentVersion.js";
import LiteDocumentSchema from "../../types/LiteDocument.js";
import MinimalDocumentVersionSchema from "../../types/MinimalDocumentVersion.js";
import { textSearchResultSchema } from "../../types/TextSearchResult.js";

export const documentsContracts = {
  create: {
    argumentsSchema: v.tuple([DocumentDefinitionSchema]),
    dataSchema: DocumentSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      ConnectorDoesNotSupportUpSyncingSchema,
      DocumentContentNotValidSchema,
      FilesNotFoundSchema,
      ReferencedDocumentsNotFoundSchema,
      MakingContentBlockingKeysFailedSchema,
      DuplicateDocumentDetectedSchema,
      UnexpectedErrorSchema,
    ],
  },
  createMany: {
    argumentsSchema: v.tuple([v.array(DocumentDefinitionSchema)]),
    dataSchema: v.array(DocumentSchema),
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      ConnectorDoesNotSupportUpSyncingSchema,
      DocumentContentNotValidSchema,
      FilesNotFoundSchema,
      ReferencedDocumentsNotFoundSchema,
      MakingContentBlockingKeysFailedSchema,
      DuplicateDocumentDetectedSchema,
      UnexpectedErrorSchema,
    ],
  },
  createNewVersion: {
    argumentsSchema: v.tuple([
      CollectionIdSchema,
      DocumentIdSchema,
      DocumentVersionIdSchema,
      v.any(),
    ]),
    dataSchema: DocumentSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      DocumentNotFoundSchema,
      ConnectorDoesNotSupportUpSyncingSchema,
      DocumentVersionIdNotMatchingSchema,
      DocumentContentNotValidSchema,
      MakingContentBlockingKeysFailedSchema,
      FilesNotFoundSchema,
      ReferencedDocumentsNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
  delete: {
    argumentsSchema: v.tuple([
      CollectionIdSchema,
      DocumentIdSchema,
      v.string(),
    ]),
    dataSchema: v.null(),
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      DocumentNotFoundSchema,
      CommandConfirmationNotValidSchema,
      ConnectorDoesNotSupportUpSyncingSchema,
      DocumentIsReferencedSchema,
      UnexpectedErrorSchema,
    ],
  },
  list: {
    argumentsSchema: v.tuple([CollectionIdSchema]),
    dataSchema: v.array(LiteDocumentSchema),
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
  listVersions: {
    argumentsSchema: v.tuple([CollectionIdSchema, DocumentIdSchema]),
    dataSchema: v.array(MinimalDocumentVersionSchema),
    errorSchemas: [
      ArgumentsNotValidSchema,
      DocumentNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
  search: {
    argumentsSchema: v.tuple([
      v.nullable(CollectionIdSchema),
      v.string(),
      v.object({ limit: v.number() }),
    ]),
    dataSchema: v.array(textSearchResultSchema(LiteDocumentSchema)),
    errorSchemas: [
      ArgumentsNotValidSchema,
      CollectionNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
  get: {
    argumentsSchema: v.tuple([CollectionIdSchema, DocumentIdSchema]),
    dataSchema: DocumentSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      DocumentNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
  getVersion: {
    argumentsSchema: v.tuple([
      CollectionIdSchema,
      DocumentIdSchema,
      DocumentVersionIdSchema,
    ]),
    dataSchema: DocumentVersionSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      DocumentVersionNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
} as const;
