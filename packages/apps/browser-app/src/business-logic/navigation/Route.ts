import type {
  AppId,
  CollectionId,
  ConversationId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";

export enum RouteName {
  Ask = "Ask",
  Conversations = "Conversations",
  Conversation = "Conversation",
  CreateCollectionManual = "CreateCollection",
  CreateCollectionAssisted = "CreateCollectionAssisted",
  CreateNewCollectionVersion = "CreateNewCollectionVersion",
  Collection = "Collection",
  CollectionSettings = "CollectionSettings",
  CreateDocument = "CreateDocument",
  Document = "Document",
  CreateApp = "CreateApp",
  EditApp = "EditApp",
  GlobalSettings = "Settings",
}

export enum CollectionRouteView {
  Table = "Table",
  App = "App",
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
  | (
      | { name: RouteName.Collection; collectionId: CollectionId }
      | {
          name: RouteName.Collection;
          collectionId: CollectionId;
          view: CollectionRouteView.Table;
        }
      | {
          name: RouteName.Collection;
          collectionId: CollectionId;
          view: CollectionRouteView.App;
          appId: AppId;
        }
    )
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
      documentVersionId?: DocumentVersionId;
      showHistory?: boolean;
    }
  | {
      name: RouteName.CreateApp;
      collectionIds: CollectionId[];
    }
  | {
      name: RouteName.EditApp;
      appId: AppId;
    }
  | {
      name: RouteName.GlobalSettings;
    };

export default Route;
