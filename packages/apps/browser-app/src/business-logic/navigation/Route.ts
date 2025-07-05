import type { CollectionId, DocumentId } from "@superego/backend";

export enum RouteName {
  Home = "Home",
  GlobalSettings = "Settings",
  CreateCollection = "CreateCollection",
  Collection = "Collection",
  CollectionSettings = "CollectionSettings",
  CreateCollectionVersion = "CreateCollectionVersion",
  CreateDocument = "CreateDocument",
  Document = "Document",
}

type Route =
  | {
      name: RouteName.Home;
    }
  | {
      name: RouteName.GlobalSettings;
    }
  | {
      name: RouteName.CreateCollection;
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
      name: RouteName.CreateCollectionVersion;
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
    };

export default Route;
