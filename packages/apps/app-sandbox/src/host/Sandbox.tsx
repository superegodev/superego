import { useEffect, useRef, useState } from "react";
import HostIpc from "../ipc/HostIpc.js";
import MessageType from "../ipc/MessageType.js";
import type AppComponentProps from "../types/AppComponentProps.js";
import type IntlMessages from "../types/IntlMessages.js";
import type Settings from "../types/Settings.js";

interface Props {
  iframeSrc: string;
  appName: string;
  appCode: string;
  appProps: AppComponentProps;
  settings: Settings;
  intlMessages: IntlMessages;
  className?: string | undefined;
}
export default function Sandbox({
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
    hostIpcRef.current = new HostIpc(window, iframeRef.current.contentWindow);
    return hostIpcRef.current.registerHandlers({
      [MessageType.SandboxReady]: () => setSandboxReady(true),
      [MessageType.HeightChanged]: (message) => {
        // Sometimes "odd things" happening inside the iframe make it so the
        // height we get is not sufficient and the iframe html element starts
        // scrolling. Adding a single pixel of height seems to solve the issue.
        const height = `${message.payload.height + 1}px`;
        if (iframeRef.current && iframeRef.current.style.height !== height) {
          iframeRef.current.style.height = height;
        }
      },
    });
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
      sandbox="allow-scripts allow-same-origin"
      title={appName}
      className={className}
    />
  );
}
