import { useEffect, useRef, useState } from "react";
import {
  isHeightChangedMessage,
  isSandboxReadyMessage,
  type RenderAppMessage,
} from "../ipc/ipc.js";
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
  const [sandboxReady, setSandboxReady] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const handleSandboxMessage = ({ data: message }: MessageEvent) => {
      if (isSandboxReadyMessage(message)) {
        setSandboxReady(true);
      }
      if (isHeightChangedMessage(message)) {
        const height = `${message.payload.height}px`;
        if (iframeRef.current && iframeRef.current.style.height !== height) {
          iframeRef.current.style.height = height;
        }
      }
    };
    window.addEventListener("message", handleSandboxMessage);
    return () => window.removeEventListener("message", handleSandboxMessage);
  }, []);

  useEffect(() => {
    if (iframeRef.current && sandboxReady) {
      iframeRef.current.contentWindow?.postMessage(
        {
          type: MessageType.RenderApp,
          payload: { appCode, appProps, settings, intlMessages },
        } satisfies RenderAppMessage,
        new URL(iframeRef.current.src, window.location.origin).origin,
      );
    }
  }, [sandboxReady, appCode, appProps, settings, intlMessages]);

  return (
    <iframe
      key={appCode}
      ref={iframeRef}
      src={iframeSrc}
      sandbox="allow-scripts allow-same-origin"
      title={appName}
      className={className}
    />
  );
}
