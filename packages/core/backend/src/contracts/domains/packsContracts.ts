import * as v from "valibot";
import AppNameNotValidSchema from "../../errors/AppNameNotValid.js";
import AppNotFoundSchema from "../../errors/AppNotFound.js";
import ArgumentsNotValidSchema from "../../errors/ArgumentsNotValid.js";
import CollectionCategoryIconNotValidSchema from "../../errors/CollectionCategoryIconNotValid.js";
import CollectionCategoryNameNotValidSchema from "../../errors/CollectionCategoryNameNotValid.js";
import CollectionCategoryNotFoundSchema from "../../errors/CollectionCategoryNotFound.js";
import CollectionNotFoundSchema from "../../errors/CollectionNotFound.js";
import CollectionSchemaNotValidSchema from "../../errors/CollectionSchemaNotValid.js";
import CollectionSettingsNotValidSchema from "../../errors/CollectionSettingsNotValid.js";
import ConnectorDoesNotSupportUpSyncingSchema from "../../errors/ConnectorDoesNotSupportUpSyncing.js";
import ContentBlockingKeysGetterNotValidSchema from "../../errors/ContentBlockingKeysGetterNotValid.js";
import ContentSummaryGetterNotValidSchema from "../../errors/ContentSummaryGetterNotValid.js";
import DefaultDocumentViewUiOptionsNotValidSchema from "../../errors/DefaultDocumentViewUiOptionsNotValid.js";
import DocumentContentNotValidSchema from "../../errors/DocumentContentNotValid.js";
import DuplicateDocumentDetectedSchema from "../../errors/DuplicateDocumentDetected.js";
import FilesNotFoundSchema from "../../errors/FilesNotFound.js";
import MakingContentBlockingKeysFailedSchema from "../../errors/MakingContentBlockingKeysFailed.js";
import PackNotValidSchema from "../../errors/PackNotValid.js";
import ParentCollectionCategoryNotFoundSchema from "../../errors/ParentCollectionCategoryNotFound.js";
import ReferencedCollectionsNotFoundSchema from "../../errors/ReferencedCollectionsNotFound.js";
import ReferencedDocumentsNotFoundSchema from "../../errors/ReferencedDocumentsNotFound.js";
import UnexpectedErrorSchema from "../../errors/UnexpectedError.js";
import AppSchema from "../../types/App.js";
import CollectionSchema from "../../types/Collection.js";
import CollectionCategorySchema from "../../types/CollectionCategory.js";
import DocumentSchema from "../../types/Document.js";
import PackSchema from "../../types/Pack.js";

export const packsContracts = {
  install: {
    argumentsSchema: v.tuple([PackSchema]),
    dataSchema: v.object({
      collectionCategories: v.array(CollectionCategorySchema),
      collections: v.array(CollectionSchema),
      apps: v.array(AppSchema),
      documents: v.array(DocumentSchema),
    }),
    errorSchemas: [
      ArgumentsNotValidSchema,
      PackNotValidSchema,
      CollectionCategoryNameNotValidSchema,
      CollectionCategoryIconNotValidSchema,
      ParentCollectionCategoryNotFoundSchema,
      CollectionSettingsNotValidSchema,
      CollectionCategoryNotFoundSchema,
      AppNotFoundSchema,
      CollectionSchemaNotValidSchema,
      ReferencedCollectionsNotFoundSchema,
      ContentBlockingKeysGetterNotValidSchema,
      ContentSummaryGetterNotValidSchema,
      DefaultDocumentViewUiOptionsNotValidSchema,
      AppNameNotValidSchema,
      CollectionNotFoundSchema,
      DocumentContentNotValidSchema,
      FilesNotFoundSchema,
      ReferencedDocumentsNotFoundSchema,
      MakingContentBlockingKeysFailedSchema,
      DuplicateDocumentDetectedSchema,
      ConnectorDoesNotSupportUpSyncingSchema,
      UnexpectedErrorSchema,
    ],
  },
} as const;
