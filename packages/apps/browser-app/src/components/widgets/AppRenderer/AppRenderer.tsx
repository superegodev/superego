import { Sandbox } from "@superego/app-sandbox/host";
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
import {
  invokeAllowedBackendMethod,
  isValidNavigationHref,
  makeIframeSrc,
  type StaticAppBridgeBackend,
} from "./AppRendererUtils.js";
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
  if (!isCompatible) {
    return <IncompatibilityWarning app={app} />;
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
          // Boutique/editor apps can still contain legacy app-sandbox imports
          // until their static bundling pipeline replaces those artifacts.
          return isLegacySandboxBuild(app) ? (
            <Sandbox
              backend={backend}
              navigateTo={sandboxNavigateTo}
              iframeSrc={
                import.meta.env["VITE_SANDBOX_URL"] ??
                "http://app-sandbox.localhost:5173/app-sandbox.html"
              }
              appName={app.name}
              appCode={getLegacySandboxAppCode(app)}
              appProps={appProps}
              settings={settings}
              intlMessages={intlMessages}
              className={cs.AppRenderer.sandbox}
            />
          ) : (
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
  backend: StaticAppBridgeBackend;
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

  const iframeSrc = useMemo(
    () => makeIframeSrc(app, { isElectron: electronMainWorld.isElectron }),
    [app],
  );

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
        if (isValidNavigationHref(message.payload?.href)) {
          navigateTo(message.payload.href);
        }
        return;
      }

      if (message.type === "InvokeBackendMethod") {
        const result = await invokeAllowedBackendMethod(
          backend,
          message.payload,
        );
        const invocationId =
          typeof message.payload?.invocationId === "string"
            ? message.payload.invocationId
            : "";
        iframeRef.current?.contentWindow?.postMessage(
          {
            sender: "Host",
            type: "RespondToBackendMethodInvocation",
            payload: {
              invocationId,
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

function isLegacySandboxBuild(app: App): boolean {
  const mainJs = app.latestVersion.files["/dist/main.js"];
  return (
    typeof mainJs?.content === "string" &&
    mainJs.content.includes("@superego/app-sandbox")
  );
}

function getLegacySandboxAppCode(app: App): string {
  const mainJs = app.latestVersion.files["/dist/main.js"];
  return typeof mainJs?.content === "string" ? mainJs.content : "";
}
