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

export const listConnectorsQuery = makeBackendQueryGetter(
  "collections",
  "listConnectors",
  () => ["listConnectors"],
);

export const useCreateCollection = makeUseBackendMutation(
  "collections",
  "create",
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
  (collectionId) => ["listDocuments", collectionId],
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
    ["getDocumentVersion", collectionId, documentId],
  ],
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

/*
 * Assistants
 */

export const useTts = makeUseBackendMutation("inference", "tts", () => []);

export const useImplementTypescriptFunction = makeUseBackendMutation(
  "inference",
  "implementTypescriptFunction",
  () => [],
);

/*
 * Background jobs
 */

export const listBackgroundJobsQuery = makeBackendQueryGetter(
  "backgroundJobs",
  "list",
  () => ["listBackgroundJobs"],
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
