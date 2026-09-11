import type {
  AppPermissions,
  Backend,
  CollectionId,
  DocumentId,
  DocumentVersionId,
  UnexpectedError,
} from "@superego/backend";
import type { Result } from "@superego/global-types";
import {
  extractErrorDetails,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import HostIpc from "../ipc/HostIpc.js";
import MessageType from "../ipc/MessageType.js";
import type AppComponentProps from "../types/AppComponentProps.js";
import type IntlMessages from "../types/IntlMessages.js";
import type Settings from "../types/Settings.js";

interface Props {
  /** Backend methods exposed to sandboxed apps. */
  backend: {
    documents: {
      create: Backend["documents"]["create"];
      createNewVersion: (
        collectionId: CollectionId,
        documentId: DocumentId,
        latestVersionId: DocumentVersionId,
        content: any,
      ) => ReturnType<Backend["documents"]["createNewVersion"]>;
      delete: (
        collectionId: CollectionId,
        documentId: DocumentId,
      ) => Result<null, never>;
    };
    files: { getContent: Backend["files"]["getContent"] };
    state: {
      get: () => ReturnType<Backend["apps"]["getState"]>;
      update: (
        latestRevision: number,
        content: any,
      ) => ReturnType<Backend["apps"]["updateState"]>;
    };
  };
  permissions: AppPermissions;
  navigateTo: (href: string) => void;
  iframeSrc: string;
  appName: string;
  appCode: string;
  appProps: AppComponentProps;
  settings: Settings;
  intlMessages: IntlMessages;
  className?: string | undefined;
}
export default function Sandbox({
  backend,
  permissions,
  navigateTo,
  iframeSrc,
  appName,
  appCode,
  appProps,
  settings,
  intlMessages,
  className,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hostIpcRef = useRef<HostIpc>(null);

  const backendRef = useRef(backend);
  const navigateToRef = useRef(navigateTo);
  useLayoutEffect(() => {
    backendRef.current = backend;
    navigateToRef.current = navigateTo;
  }, [backend, navigateTo]);

  const [sandboxReady, setSandboxReady] = useState(false);

  useEffect(() => {
    if (!(iframeRef.current && iframeRef.current.contentWindow)) {
      return;
    }
    const hostIpc = new HostIpc(window, iframeRef.current.contentWindow);
    hostIpcRef.current = hostIpc;
    let active = true;
    const unregister = hostIpc.registerHandlers({
      [MessageType.SandboxReady]: () => setSandboxReady(true),
      [MessageType.InvokeBackendMethod]: async ({ payload }) => {
        let result;
        try {
          result = await (backendRef.current as any)[payload.entity][
            payload.method
          ](...payload.args);
        } catch (error) {
          result = makeUnsuccessfulResult<UnexpectedError>({
            name: "UnexpectedError",
            details: { cause: extractErrorDetails(error) },
          });
        }
        if (!active) {
          return;
        }
        hostIpc.send({
          type: MessageType.RespondToBackendMethodInvocation,
          payload: { invocationId: payload.invocationId, result },
        });
      },
      [MessageType.NavigateHostTo]: ({ payload }) =>
        navigateToRef.current(payload.href),
    });
    return () => {
      active = false;
      unregister();
      hostIpcRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (hostIpcRef.current && sandboxReady) {
      hostIpcRef.current.send({
        type: MessageType.RenderApp,
        payload: {
          appCode,
          appProps,
          settings,
          intlMessages,
          allowedOrigins: permissions.http.allowedOrigins,
        },
      });
    }
  }, [sandboxReady, appCode, appProps, settings, intlMessages, permissions]);

  return (
    <iframe
      ref={iframeRef}
      src={iframeSrc}
      sandbox={[
        "allow-scripts",
        "allow-same-origin",
        permissions.modals && "allow-modals",
        permissions.downloads && "allow-downloads",
      ]
        .filter(Boolean)
        .join(" ")}
      title={appName}
      className={className}
    />
  );
}
