import type {
  CollectionId,
  ConversationId,
  DocumentId,
} from "@superego/backend";

export enum RouteName {
  Ask = "Ask",
  Conversations = "Conversations",
  Conversation = "Conversation",
  CreateCollectionManual = "CreateCollection",
  CreateCollectionAssisted = "StartCollectionCreatorConversation",
  CreateNewCollectionVersion = "CreateNewCollectionVersion",
  Collection = "Collection",
  CollectionSettings = "CollectionSettings",
  CreateDocument = "CreateDocument",
  Document = "Document",
  GlobalSettings = "Settings",
}

type Route =
  | {
      name: RouteName.Ask;
    }
  | {
      name: RouteName.Conversations;
    }
  | {
      name: RouteName.Conversation;
      conversationId: ConversationId;
    }
  | {
      name: RouteName.CreateCollectionAssisted;
      initialMessage?: string;
    }
  | {
      name: RouteName.CreateCollectionManual;
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
      name: RouteName.GlobalSettings;
    };

export default Route;
