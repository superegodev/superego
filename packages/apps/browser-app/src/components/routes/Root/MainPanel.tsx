import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import Collection from "../Collection/Collection.js";
import CollectionSettings from "../CollectionSettings/CollectionSettings.js";
import Conversation from "../Conversation/Conversation.jsx";
import CreateCollection from "../CreateCollection/CreateCollection.js";
import CreateDocument from "../CreateDocument/CreateDocument.js";
import CreateNewCollectionVersion from "../CreateNewCollectionVersion/CreateNewCollectionVersion.js";
import Document from "../Document/Document.js";
import GlobalSettings from "../GlobalSettings/GlobalSettings.js";
import Home from "../Home/Home.js";

export default function MainPanel() {
  const { activeRoute } = useNavigationState();
  switch (activeRoute.name) {
    case RouteName.Home:
      return <Home />;
    case RouteName.GlobalSettings:
      return <GlobalSettings />;
    case RouteName.CreateCollection:
      return <CreateCollection />;
    case RouteName.Collection:
      return <Collection collectionId={activeRoute.collectionId} />;
    case RouteName.CollectionSettings:
      return <CollectionSettings collectionId={activeRoute.collectionId} />;
    case RouteName.CreateCollectionVersion:
      return (
        <CreateNewCollectionVersion collectionId={activeRoute.collectionId} />
      );
    case RouteName.CreateDocument:
      return <CreateDocument collectionId={activeRoute.collectionId} />;
    case RouteName.Document:
      return (
        <Document
          collectionId={activeRoute.collectionId}
          documentId={activeRoute.documentId}
        />
      );
    case RouteName.Conversations:
      return "TODO";
    case RouteName.Conversation:
      return <Conversation conversationId={activeRoute.conversationId} />;
  }
}
