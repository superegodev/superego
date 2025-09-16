import type {
  CollectionId,
  ConversationId,
  DocumentId,
} from "@superego/backend";

export enum RouteName {
  Assistant = "Assistant",
  GlobalSettings = "Settings",
  CreateCollection = "CreateCollection",
  CreateNewCollectionVersion = "CreateNewCollectionVersion",
  Collection = "Collection",
  CollectionSettings = "CollectionSettings",
  CreateDocument = "CreateDocument",
  Document = "Document",
  Conversation = "Conversation",
  Conversations = "Conversations",
}

type Route =
  | {
      name: RouteName.Assistant;
    }
  | {
      name: RouteName.GlobalSettings;
    }
  | {
      name: RouteName.CreateCollection;
    }
  | {
      name: RouteName.CreateNewCollectionVersion;
      collectionId: CollectionId;
    }
  | {
      name: RouteName.Collection;
      collectionId: CollectionId;
    }
  | {
      name: RouteName.CollectionSettings;
      collectionId: CollectionId;
    }
  | {
      name: RouteName.CreateDocument;
      collectionId: CollectionId;
    }
  | {
      name: RouteName.Document;
      collectionId: CollectionId;
      documentId: DocumentId;
    }
  | {
      name: RouteName.Conversations;
    }
  | {
      name: RouteName.Conversation;
      conversationId: ConversationId;
    };

export default Route;
