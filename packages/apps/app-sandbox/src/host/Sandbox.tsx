import type { AppPermissions } from "@superego/backend";
import { useEffect, useRef, useState } from "react";
import dispatchOperation, {
  type HostBackend,
} from "../ipc/dispatchOperation.js";
import HostIpc from "../ipc/HostIpc.js";
import MessageType from "../ipc/MessageType.js";
import type AppComponentProps from "../types/AppComponentProps.js";
import type IntlMessages from "../types/IntlMessages.js";
import type Settings from "../types/Settings.js";

interface Props {
  /** Backend methods exposed to sandboxed apps. */
  backend: HostBackend;
  permissions?: AppPermissions | undefined;
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
  backendRef.current = backend;
  const navigateToRef = useRef(navigateTo);
  navigateToRef.current = navigateTo;

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
          result = await dispatchOperation(
            backendRef.current,
            payload.entity,
            payload.method,
            payload.args,
          );
        } catch {
          result = {
            success: false as const,
            data: null,
            error: {
              name: "AppBridgeError",
              details: { reason: "TransportFailure" },
            },
          };
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
        payload: { appCode, appProps, settings, intlMessages },
      });
    }
  }, [sandboxReady, appCode, appProps, settings, intlMessages]);

  return (
    <iframe
      ref={iframeRef}
      src={iframeSrc}
      sandbox={[
        "allow-scripts",
        "allow-same-origin",
        permissions?.modals && "allow-modals",
        permissions?.downloads && "allow-downloads",
      ]
        .filter(Boolean)
        .join(" ")}
      title={appName}
      className={className}
    />
  );
}
