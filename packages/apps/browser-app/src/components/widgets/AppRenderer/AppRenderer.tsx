import type { App, Document } from "@superego/backend";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { listDocumentsQuery } from "../../../business-logic/backend/hooks.js";
import Sandbox from "./Sandbox.jsx";

interface Props {
  app: App;
}
export default function AppRenderer({ app }: Props) {
  const { collections } = useGlobalData();

  const targetCollections = collections.filter((collection) =>
    app.latestVersion.targetCollections.some(
      (targetCollection) =>
        collection.id === targetCollection.id &&
        collection.latestVersion.id === targetCollection.versionId,
    ),
  );

  if (targetCollections.length !== app.latestVersion.targetCollections.length) {
    // TODO: warn if app references a non-existing or out of date collection
    return null;
  }

  return (
    <DataLoader
      queries={targetCollections.map(({ id }) =>
        listDocumentsQuery([id, false]),
      )}
    >
      {(...documentsLists) => (
        <Sandbox
          appName={app.name}
          appCode={app.latestVersion.files["/main.tsx"].compiled}
          appProps={{
            collections: targetCollections.map((collection, index) => ({
              id: collection.id,
              name: collection.settings.name,
              icon: collection.settings.icon,
              documents: documentsLists[index]!.map((document) => ({
                id: document.id,
                content: (document as Document).latestVersion.content,
              })),
            })),
          }}
        />
      )}
    </DataLoader>
  );
}
