import { Sandbox } from "@superego/app-sandbox/host";
import type {
  AppComponentProps,
  IntlMessages,
  Settings,
} from "@superego/app-sandbox/types";
import type { App, Document } from "@superego/backend";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { listDocumentsQuery } from "../../../business-logic/backend/hooks.js";
import useTheme from "../../../business-logic/theme/useTheme.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import * as cs from "./AppRenderer.css.js";
import getIntlMessages from "./getIntlMessages.js";
import IncompatibilityWarning from "./IncompatibilityWarning.js";

interface Props {
  app: App;
}
export default function AppRenderer({ app }: Props) {
  const intl = useIntl();
  const theme = useTheme();
  const { collections } = useGlobalData();
  const collectionsMap = CollectionUtils.makeMap(collections);

  const [incompatibilityWarningDismissed, setIncompatibilityWarningDismissed] =
    useState(false);
  // Reset incompatibilityWarningDismissed when the app changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    setIncompatibilityWarningDismissed(false);
  }, [app.id]);

  const settings: Settings = useMemo(() => ({ theme }), [theme]);
  const intlMessages: IntlMessages = useMemo(
    () => getIntlMessages(intl),
    [intl],
  );

  const isCompatible = app.latestVersion.targetCollections.every(
    (targetCollection) =>
      collectionsMap[targetCollection.id]?.latestVersion.id ===
      targetCollection.versionId,
  );
  if (!isCompatible && !incompatibilityWarningDismissed) {
    return (
      <IncompatibilityWarning
        app={app}
        onDismiss={() => setIncompatibilityWarningDismissed(true)}
      />
    );
  }

  const targetCollections = app.latestVersion.targetCollections
    .map((targetCollection) => collectionsMap[targetCollection.id])
    .filter((collection) => collection !== undefined);
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
