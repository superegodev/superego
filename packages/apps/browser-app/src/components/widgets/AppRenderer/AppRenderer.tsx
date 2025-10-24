import { Sandbox } from "@superego/app-sandbox/host";
import type {
  AppComponentProps,
  IntlMessages,
  Settings,
} from "@superego/app-sandbox/types";
import type { App, Document } from "@superego/backend";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { listDocumentsQuery } from "../../../business-logic/backend/hooks.js";
import useTheme from "../../../business-logic/theme/useTheme.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import * as cs from "./AppRenderer.css.js";
import getIntlMessages from "./getIntlMessages.js";

interface Props {
  app: App;
}
export default function AppRenderer({ app }: Props) {
  const intl = useIntl();
  const theme = useTheme();
  const { collections } = useGlobalData();

  const targetCollections = collections.filter((collection) =>
    app.latestVersion.targetCollections.some(
      (targetCollection) =>
        collection.id === targetCollection.id &&
        collection.latestVersion.id === targetCollection.versionId,
    ),
  );

  const settings: Settings = useMemo(() => ({ theme }), [theme]);
  const intlMessages: IntlMessages = useMemo(
    () => getIntlMessages(intl),
    [intl],
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
          // TODO: pass from outside? See when building electron.
          iframeSrc="http://sandbox.localhost:5173/app-sandbox.html"
          appName={app.name}
          appCode={app.latestVersion.files["/main.tsx"].compiled}
          appProps={{
            collections: Object.fromEntries(
              targetCollections.map((collection, index) => [
                collection.id,
                {
                  id: collection.id,
                  displayName: CollectionUtils.getDisplayName(collection),
                  documents: documentsLists[index]!.map((document) => ({
                    id: document.id,
                    content: (document as Document).latestVersion.content,
                  })),
                },
              ]),
            ) satisfies AppComponentProps["collections"],
          }}
          settings={settings}
          intlMessages={intlMessages}
          className={cs.AppRenderer.sandbox}
        />
      )}
    </DataLoader>
  );
}
