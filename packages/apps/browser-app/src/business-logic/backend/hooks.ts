import { makeBackendQueryGetter } from "./BackendQuery.js";
import type { SuccessfulResultOf } from "./typeUtils.js";
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

export const listConnectorsQuery = makeBackendQueryGetter(
  "collections",
  "listConnectors",
  () => ["listConnectors"],
);

export const getCollectionVersionQuery = makeBackendQueryGetter(
  "collections",
  "getVersion",
  (collectionId, collectionVersionId) => [
    "getCollectionVersion",
    collectionId,
    collectionVersionId,
  ],
);

export const useCreateCollection = makeUseBackendMutation(
  "collections",
  "create",
  () => [["listCollections"], ["listConversations"], ["getConversation"]],
);

export const useCreateManyCollections = makeUseBackendMutation(
  "collections",
  "createMany",
  () => [["listCollections"], ["listConversations"], ["getConversation"]],
);

export const useUpdateCollectionSettings = makeUseBackendMutation(
  "collections",
  "updateSettings",
  () => [["listCollections"]],
);

export const useSetCollectionRemote = makeUseBackendMutation(
  "collections",
  "setRemote",
  ([collectionId]) => [
    ["listCollections"],
    ["listDocuments", collectionId],
    ["getDocument", collectionId],
    ["getDocumentVersion", collectionId],
  ],
);

export const useTriggerCollectionDownSync = makeUseBackendMutation(
  "collections",
  "triggerDownSync",
  () => [["listCollections"]],
);

export const useCreateNewCollectionVersion = makeUseBackendMutation(
  "collections",
  "createNewVersion",
  ([collectionId]) => [
    ["listCollections"],
    ["listDocuments", collectionId],
    ["getDocument", collectionId],
  ],
);

export const useUpdateLatestCollectionVersionSettings = makeUseBackendMutation(
  "collections",
  "updateLatestVersionSettings",
  ([collectionId]) => [
    ["listCollections"],
    ["listDocuments", collectionId],
    ["getDocument", collectionId],
    ["getDocumentVersion", collectionId],
  ],
);

export const useDeleteCollection = makeUseBackendMutation(
  "collections",
  "delete",
  ([collectionId]) => [
    ["listCollections"],
    ["listDocuments", collectionId],
    ["getDocument", collectionId],
    ["getDocumentVersion", collectionId],
  ],
);

/*
 * Documents
 */

export const listDocumentsQuery = makeBackendQueryGetter(
  "documents",
  "list",
  (collectionId, lite) => ["listDocuments", collectionId, String(lite ?? true)],
);

export const getDocumentQuery = makeBackendQueryGetter(
  "documents",
  "get",
  (collectionId, documentId) => ["getDocument", collectionId, documentId],
);

export const getDocumentVersionQuery = makeBackendQueryGetter(
  "documents",
  "getVersion",
  (collectionId, documentId, documentVersionId) => [
    "getDocumentVersion",
    collectionId,
    documentId,
    documentVersionId,
  ],
);

export const listDocumentVersionsQuery = makeBackendQueryGetter(
  "documents",
  "listVersions",
  (collectionId, documentId) => [
    "listDocumentVersions",
    collectionId,
    documentId,
  ],
);

export const useCreateDocument = makeUseBackendMutation(
  "documents",
  "create",
  ([{ collectionId }]) => [["listDocuments", collectionId, "true"]],
  // Manually update the non-lite listDocuments cache to improve performance of
  // apps.
  (queryClient, [{ collectionId }], data) => {
    const listDocumentsKey = ["listDocuments", collectionId, "false"];
    const listDocuments: SuccessfulResultOf<"documents", "list"> | undefined =
      queryClient.getQueryData(listDocumentsKey);
    if (listDocuments) {
      queryClient.setQueryData(listDocumentsKey, {
        ...listDocuments,
        data: [...listDocuments.data, data],
      });
    }
  },
);

export const useCreateNewDocumentVersion = makeUseBackendMutation(
  "documents",
  "createNewVersion",
  ([collectionId, documentId]) => [
    ["listDocuments", collectionId, "true"],
    ["getDocument", collectionId, documentId],
    ["listDocumentVersions", collectionId, documentId],
  ],
  // Manually update the non-lite listDocuments cache to improve performance of
  // apps.
  (queryClient, [collectionId], data) => {
    const listDocumentsKey = ["listDocuments", collectionId, "false"];
    const listDocuments: SuccessfulResultOf<"documents", "list"> | undefined =
      queryClient.getQueryData(listDocumentsKey);
    if (listDocuments) {
      queryClient.setQueryData(listDocumentsKey, {
        ...listDocuments,
        data: listDocuments.data.map((document) =>
          document.id === data.id ? data : document,
        ),
      });
    }
  },
);

export const useDeleteDocument = makeUseBackendMutation(
  "documents",
  "delete",
  ([collectionId, documentId]) => [
    ["listDocuments", collectionId, "true"],
    ["getDocument", collectionId, documentId],
    ["getDocumentVersion", collectionId, documentId],
  ],
  // Manually update the non-lite listDocuments cache to improve performance of
  // apps.
  (queryClient, [collectionId, documentId]) => {
    const listDocumentsKey = ["listDocuments", collectionId, "false"];
    const listDocuments: SuccessfulResultOf<"documents", "list"> | undefined =
      queryClient.getQueryData(listDocumentsKey);
    if (listDocuments) {
      queryClient.setQueryData(listDocumentsKey, {
        ...listDocuments,
        data: listDocuments.data.filter(
          (document) => document.id !== documentId,
        ),
      });
    }
  },
);

/*
 * Assistants
 */

export const listConversationsQuery = makeBackendQueryGetter(
  "assistants",
  "listConversations",
  () => ["listConversations"],
);

export const getConversationQuery = makeBackendQueryGetter(
  "assistants",
  "getConversation",
  (conversationId) => ["getConversation", conversationId],
);

export const getDeveloperPromptsQuery = makeBackendQueryGetter(
  "assistants",
  "getDeveloperPrompts",
  () => ["getDeveloperPrompts"],
);

export const useStartConversation = makeUseBackendMutation(
  "assistants",
  "startConversation",
  () => [["listConversations"]],
);

export const useContinueConversation = makeUseBackendMutation(
  "assistants",
  "continueConversation",
  ([conversationId]) => [
    ["listConversations"],
    ["getConversation", conversationId],
  ],
);

export const useRetryLastResponse = makeUseBackendMutation(
  "assistants",
  "retryLastResponse",
  ([conversationId]) => [
    ["listConversations"],
    ["getConversation", conversationId],
  ],
);

export const useRecoverConversation = makeUseBackendMutation(
  "assistants",
  "recoverConversation",
  ([conversationId]) => [
    ["listConversations"],
    ["getConversation", conversationId],
  ],
);

export const useDeleteConversation = makeUseBackendMutation(
  "assistants",
  "deleteConversation",
  ([conversationId]) => [
    ["listConversations"],
    ["getConversation", conversationId],
  ],
);

export const useStt = makeUseBackendMutation("inference", "stt", () => []);

export const useTts = makeUseBackendMutation("inference", "tts", () => []);

export const useImplementTypescriptModule = makeUseBackendMutation(
  "inference",
  "implementTypescriptModule",
  () => [],
);

/*
 * Apps
 */

export const listAppsQuery = makeBackendQueryGetter("apps", "list", () => [
  "listApps",
]);

export const useCreateApp = makeUseBackendMutation("apps", "create", () => [
  ["listApps"],
]);

export const useUpdateAppName = makeUseBackendMutation(
  "apps",
  "updateName",
  () => [["listApps"]],
);

export const useUpdateAppSettings = makeUseBackendMutation(
  "apps",
  "updateSettings",
  () => [["listApps"]],
);

export const useCreateNewAppVersion = makeUseBackendMutation(
  "apps",
  "createNewVersion",
  () => [["listApps"]],
);

export const useDeleteApp = makeUseBackendMutation("apps", "delete", () => [
  ["listApps"],
]);

/*
 * Packs
 */

export const useInstallPack = makeUseBackendMutation("packs", "install", () => [
  ["listCollectionCategories"],
  ["listCollections"],
  ["listApps"],
  ["listDocuments"],
]);

/*
 * Bazaar
 */

export const listBazaarPacksQuery = makeBackendQueryGetter(
  "bazaar",
  "listPacks",
  () => ["listBazaarPacks"],
);

export const getBazaarPackQuery = makeBackendQueryGetter(
  "bazaar",
  "getPack",
  (packId) => ["getBazaarPack", packId],
);

/*
 * Background jobs
 */

export const listBackgroundJobsQuery = makeBackendQueryGetter(
  "backgroundJobs",
  "list",
  () => ["listBackgroundJobs"],
);

export const getBackgroundJobQuery = makeBackendQueryGetter(
  "backgroundJobs",
  "get",
  (backgroundJobId) => ["getBackgroundJob", backgroundJobId],
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
