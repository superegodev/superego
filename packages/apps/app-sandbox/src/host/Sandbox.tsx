import type { Backend } from "@superego/backend";
import { useEffect, useRef, useState } from "react";
import HostIpc from "../ipc/HostIpc.js";
import MessageType from "../ipc/MessageType.js";
import type AppComponentProps from "../types/AppComponentProps.js";
import type IntlMessages from "../types/IntlMessages.js";
import type Settings from "../types/Settings.js";

interface Props {
  /** Subset of the Backend interface. */
  backend: {
    documents: {
      create: Backend["documents"]["create"];
      createNewVersion: Backend["documents"]["createNewVersion"];
    };
    files: {
      getContent: Backend["files"]["getContent"];
    };
  };
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

  const [sandboxReady, setSandboxReady] = useState(false);

  useEffect(() => {
    if (!(iframeRef.current && iframeRef.current.contentWindow)) {
      return;
    }
    const hostIpc = new HostIpc(window, iframeRef.current.contentWindow);
    hostIpcRef.current = hostIpc;
    return hostIpc.registerHandlers({
      [MessageType.SandboxReady]: () => setSandboxReady(true),
      [MessageType.HeightChanged]: (message) => {
        const height = `${message.payload.height}px`;
        if (iframeRef.current && iframeRef.current.style.height !== height) {
          iframeRef.current.style.height = height;
        }
      },
      [MessageType.InvokeBackendMethod]: async ({ payload }) => {
        const result = await (backend as any)[payload.entity][payload.method](
          ...payload.args,
        );
        hostIpc.send({
          type: MessageType.RespondToBackendMethodInvocation,
          payload: { invocationId: payload.invocationId, result },
        });
      },
      [MessageType.NavigateHostTo]: ({ payload }) => navigateTo(payload.href),
    });
  }, [backend, navigateTo]);

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
      sandbox="allow-scripts allow-same-origin"
      title={appName}
      className={className}
    />
  );
}
