import type {
  AppComponentProps,
  IntlMessages,
  Settings,
} from "@superego/app-sandbox/types";
import type {
  App,
  CollectionId,
  Document,
  DocumentId,
} from "@superego/backend";
import { makeSuccessfulResult } from "@superego/shared-utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import {
  listDocumentsQuery,
  useCreateDocument,
  useCreateNewDocumentVersion,
} from "../../../business-logic/backend/hooks.js";
import useBackend from "../../../business-logic/backend/useBackend.js";
import { electronMainWorld } from "../../../business-logic/electron/electron.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import {
  fromHref,
  toHref,
} from "../../../business-logic/navigation/RouteUtils.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import useTheme from "../../../business-logic/theme/useTheme.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import DeleteDocumentModalForm from "../DeleteDocumentModalForm/DeleteDocumentModalForm.js";
import * as cs from "./AppRenderer.css.js";
import getIntlMessages from "./getIntlMessages.js";
import IncompatibilityWarning from "./IncompatibilityWarning.js";

interface Props {
  app: App;
}
export default function AppRenderer({ app }: Props) {
  const intl = useIntl();
  const theme = useTheme();
  const { navigateTo } = useNavigationState();
  const { collections } = useGlobalData();
  const collectionsById = CollectionUtils.makeByIdMap(collections);

  const [deleteModalState, setDeleteModalState] = useState<{
    collectionId: CollectionId;
    documentId: DocumentId;
  } | null>(null);

  const backend = {
    // Pass these as mutation so the query cache is automatically invalidated.
    documents: {
      create: useCreateDocument().mutate,
      createNewVersion: useCreateNewDocumentVersion().mutate,
      delete: (collectionId: CollectionId, documentId: DocumentId) => {
        setDeleteModalState({ collectionId, documentId });
        return makeSuccessfulResult(null);
      },
    },
    files: {
      getContent: useBackend().files.getContent,
    },
  };

  const [incompatibilityWarningDismissed, setIncompatibilityWarningDismissed] =
    useState(false);
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
      navigateTo(fromHref(new URL(href, window.location.origin).pathname));
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
    <>
      <DataLoader
        queries={targetCollections.map(({ id }) =>
          listDocumentsQuery([id, false]),
        )}
      >
        {(...documentsLists) => {
          const appProps = {
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
            ),
          } satisfies AppComponentProps;
          return (
            <StaticAppIframe
              app={app}
              backend={backend}
              navigateTo={sandboxNavigateTo}
              appProps={appProps}
              settings={settings}
              intlMessages={intlMessages}
            />
          );
        }}
      </DataLoader>
      {deleteModalState !== null ? (
        <DeleteDocumentModalForm
          collectionId={deleteModalState.collectionId}
          documentId={deleteModalState.documentId}
          isOpen={true}
          onClose={() => setDeleteModalState(null)}
        />
      ) : null}
    </>
  );
}

interface StaticAppIframeProps {
  app: App;
  backend: {
    documents: {
      create: (...args: any[]) => any;
      createNewVersion: (...args: any[]) => any;
      delete: (...args: any[]) => any;
    };
    files: {
      getContent: (...args: any[]) => any;
    };
  };
  navigateTo: (href: string) => void;
  appProps: AppComponentProps;
  settings: Settings;
  intlMessages: IntlMessages;
}
function StaticAppIframe({
  app,
  backend,
  navigateTo,
  appProps,
  settings,
  intlMessages,
}: StaticAppIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [sandboxReady, setSandboxReady] = useState(false);

  const iframeSrc = useMemo(() => makeIframeSrc(app), [app]);

  useEffect(() => {
    setSandboxReady(false);
  }, [iframeSrc]);

  useEffect(() => {
    const handleMessage = async ({ data: message, source }: MessageEvent) => {
      if (source !== iframeRef.current?.contentWindow) {
        return;
      }
      if (!isSandboxMessage(message)) {
        return;
      }

      if (message.type === "SandboxReady") {
        setSandboxReady(true);
        return;
      }

      if (message.type === "NavigateHostTo") {
        navigateTo(message.payload.href);
        return;
      }

      if (message.type === "InvokeBackendMethod") {
        const result = await (backend as any)[message.payload.entity][
          message.payload.method
        ](...message.payload.args);
        iframeRef.current?.contentWindow?.postMessage(
          {
            sender: "Host",
            type: "RespondToBackendMethodInvocation",
            payload: {
              invocationId: message.payload.invocationId,
              result,
            },
          },
          "*",
        );
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [backend, navigateTo]);

  useEffect(() => {
    if (!sandboxReady) {
      return;
    }
    iframeRef.current?.contentWindow?.postMessage(
      {
        sender: "Host",
        type: "RenderApp",
        payload: { appCode: "", appProps, settings, intlMessages },
      },
      "*",
    );
  }, [appProps, intlMessages, sandboxReady, settings]);

  useEffect(() => {
    return () => {
      if (iframeSrc.startsWith("blob:")) {
        URL.revokeObjectURL(iframeSrc);
      }
    };
  }, [iframeSrc]);

  return (
    <iframe
      ref={iframeRef}
      src={iframeSrc}
      sandbox="allow-scripts allow-same-origin"
      title={app.name}
      className={cs.AppRenderer.sandbox}
    />
  );
}

function isSandboxMessage(message: unknown): message is {
  sender: "Sandbox";
  type: "SandboxReady" | "NavigateHostTo" | "InvokeBackendMethod";
  payload: any;
} {
  return (
    typeof message === "object" &&
    message !== null &&
    (message as any).sender === "Sandbox" &&
    typeof (message as any).type === "string"
  );
}

function makeIframeSrc(app: App): string {
  if (electronMainWorld.isElectron) {
    return `dev.superego.app://${app.id}/${app.latestVersion.id}${app.latestVersion.entrypoint}`;
  }

  const entrypoint = app.latestVersion.files[app.latestVersion.entrypoint];
  const content =
    typeof entrypoint?.content === "string"
      ? entrypoint.content
      : "<!doctype html><html><body>App entrypoint is not text.</body></html>";
  return URL.createObjectURL(new Blob([content], { type: "text/html" }));
}
