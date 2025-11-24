import { Sandbox } from "@superego/app-sandbox/host";
import type {
  AppComponentProps,
  IntlMessages,
  Settings,
} from "@superego/app-sandbox/types";
import type { App, Document } from "@superego/backend";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { listDocumentsQuery } from "../../../business-logic/backend/hooks.js";
import useBackend from "../../../business-logic/backend/useBackend.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import {
  fromHref,
  toHref,
} from "../../../business-logic/navigation/RouteUtils.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
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
  const backend = useBackend();
  const { navigateTo } = useNavigationState();
  const { collections } = useGlobalData();
  const collectionsById = CollectionUtils.makeByIdMap(collections);

  const [incompatibilityWarningDismissed, setIncompatibilityWarningDismissed] =
    useState(false);
  // We want to reset incompatibilityWarningDismissed when the app changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    setIncompatibilityWarningDismissed(false);
  }, [app.id]);

  const settings: Settings = useMemo(() => ({ theme }), [theme]);
  const intlMessages: IntlMessages = useMemo(
    () => getIntlMessages(intl),
    [intl],
  );

  const sandboxNavigateTo = useCallback(
    (href: string) => {
      navigateTo(fromHref(new URL(href).pathname));
    },
    [navigateTo],
  );

  const isCompatible = app.latestVersion.targetCollections.every(
    (targetCollection) =>
      collectionsById[targetCollection.id]?.latestVersion.id ===
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
    .map((targetCollection) => collectionsById[targetCollection.id])
    .filter((collection) => collection !== undefined);
  return (
    <DataLoader
      queries={targetCollections.map(({ id }) =>
        listDocumentsQuery([id, false]),
      )}
    >
      {(...documentsLists) => (
        <Sandbox
          backend={backend}
          navigateTo={sandboxNavigateTo}
          iframeSrc={
            import.meta.env["VITE_SANDBOX_URL"] ??
            "http://app-sandbox.localhost:5173/app-sandbox.html"
          }
          appName={app.name}
          appCode={app.latestVersion.files["/main.tsx"].compiled}
          appProps={{
            collections: Object.fromEntries(
              targetCollections.map((collection, index) => [
                collection.id,
                {
                  id: collection.id,
                  versionId: collection.latestVersion.id,
                  displayName: CollectionUtils.getDisplayName(collection),
                  documents: documentsLists[index]!.map((document) => ({
                    id: document.id,
                    versionId: document.latestVersion.id,
                    href: `${window.location.origin}${toHref({
                      name: RouteName.Document,
                      collectionId: collection.id,
                      documentId: document.id,
                    })}`,
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
