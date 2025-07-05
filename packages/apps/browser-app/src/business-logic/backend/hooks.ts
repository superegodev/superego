import { makeBackendQueryGetter } from "./BackendQuery.js";
import { makeUseBackendMutation } from "./UseBackendMutation.js";

/*
 * Collection categories
 */

export const listCollectionCategoriesQuery = makeBackendQueryGetter(
  "collectionCategories",
  "list",
  () => ["listCollectionCategories"],
);

export const useCreateCollectionCategory = makeUseBackendMutation(
  "collectionCategories",
  "create",
  () => [["listCollectionCategories"]],
);

export const useUpdateCollectionCategory = makeUseBackendMutation(
  "collectionCategories",
  "update",
  () => [["listCollectionCategories"]],
);

export const useDeleteCollectionCategory = makeUseBackendMutation(
  "collectionCategories",
  "delete",
  () => [["listCollectionCategories"]],
);

/*
 * Collections
 */

export const listCollectionsQuery = makeBackendQueryGetter(
  "collections",
  "list",
  () => ["listCollections"],
);

export const useCreateCollection = makeUseBackendMutation(
  "collections",
  "create",
  () => [["listCollections"]],
);

export const useCreateNewCollectionVersion = makeUseBackendMutation(
  "collections",
  "createNewVersion",
  ([collectionId]) => [["listCollections"], ["listDocuments", collectionId]],
);

export const useUpdateCollectionSettings = makeUseBackendMutation(
  "collections",
  "updateSettings",
  () => [["listCollections"]],
);

export const useUpdateLatestCollectionVersionSettings = makeUseBackendMutation(
  "collections",
  "updateLatestVersionSettings",
  ([collectionId]) => [["listCollections"], ["listDocuments", collectionId]],
);

export const useDeleteCollection = makeUseBackendMutation(
  "collections",
  "delete",
  ([collectionId]) => [["listCollections"], ["listDocuments", collectionId]],
);

/*
 * Documents
 */

export const listDocumentsQuery = makeBackendQueryGetter(
  "documents",
  "list",
  (collectionId) => ["listDocuments", collectionId],
);

export const getDocumentQuery = makeBackendQueryGetter(
  "documents",
  "get",
  (collectionId, documentId) => ["getDocument", collectionId, documentId],
);

export const useCreateDocument = makeUseBackendMutation(
  "documents",
  "create",
  ([collectionId]) => [["listDocuments", collectionId]],
);

export const useCreateNewDocumentVersion = makeUseBackendMutation(
  "documents",
  "createNewVersion",
  ([collectionId, documentId]) => [
    ["listDocuments", collectionId],
    ["getDocument", collectionId, documentId],
  ],
);

export const useDeleteDocument = makeUseBackendMutation(
  "documents",
  "delete",
  ([collectionId, documentId]) => [
    ["listDocuments", collectionId],
    ["getDocument", collectionId, documentId],
  ],
);

/*
 * Global settings
 */

export const getGlobalSettingsQuery = makeBackendQueryGetter(
  "globalSettings",
  "get",
  () => ["getGlobalSettings"],
);

export const useUpdateGlobalSettings = makeUseBackendMutation(
  "globalSettings",
  "update",
  () => [["getGlobalSettings"]],
);
