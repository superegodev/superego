import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import Ask from "../Ask/Ask.js";
import BackgroundJob from "../BackgroundJob/BackgroundJob.js";
import BackgroundJobs from "../BackgroundJobs/BackgroundJobs.js";
import Collection from "../Collection/Collection.js";
import CollectionSettings from "../CollectionSettings/CollectionSettings.js";
import Conversation from "../Conversation/Conversation.js";
import Conversations from "../Conversations/Conversations.js";
import CreateApp from "../CreateApp/CreateApp.js";
import CreateCollectionAssisted from "../CreateCollectionAssisted/CreateCollectionAssisted.js";
import CreateCollectionManual from "../CreateCollectionManual/CreateCollectionManual.js";
import CreateDocument from "../CreateDocument/CreateDocument.js";
import CreateNewCollectionVersion from "../CreateNewCollectionVersion/CreateNewCollectionVersion.js";
import Document from "../Document/Document.js";
import EditApp from "../EditApp/EditApp.js";
import GlobalSettings from "../GlobalSettings/GlobalSettings.js";

export default function MainPanel() {
  const { activeRoute } = useNavigationState();
  switch (activeRoute.name) {
    case RouteName.Ask:
      return <Ask />;
    case RouteName.Conversations:
      return <Conversations />;
    case RouteName.Conversation:
      return <Conversation conversationId={activeRoute.conversationId} />;
    case RouteName.CreateCollectionAssisted:
      return (
        <CreateCollectionAssisted initialMessage={activeRoute.initialMessage} />
      );
    case RouteName.CreateCollectionManual:
      return <CreateCollectionManual />;
    case RouteName.CreateNewCollectionVersion:
      return (
        <CreateNewCollectionVersion collectionId={activeRoute.collectionId} />
      );
    case RouteName.Collection: {
      const { name, ...props } = activeRoute;
      return <Collection {...props} />;
    }
    case RouteName.CollectionSettings:
      return <CollectionSettings collectionId={activeRoute.collectionId} />;
    case RouteName.CreateDocument:
      return <CreateDocument collectionId={activeRoute.collectionId} />;
    case RouteName.Document:
      return (
        <Document
          collectionId={activeRoute.collectionId}
          documentId={activeRoute.documentId}
          documentVersionId={activeRoute.documentVersionId}
        />
      );
    case RouteName.CreateApp:
      return <CreateApp collectionIds={activeRoute.collectionIds} />;
    case RouteName.EditApp:
      return <EditApp appId={activeRoute.appId} />;
    case RouteName.BackgroundJobs:
      return <BackgroundJobs />;
    case RouteName.BackgroundJob:
      return <BackgroundJob backgroundJobId={activeRoute.backgroundJobId} />;
    case RouteName.GlobalSettings:
      return <GlobalSettings />;
  }
}
