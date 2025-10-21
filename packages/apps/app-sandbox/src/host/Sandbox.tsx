import type { Theme } from "@superego/backend";
import { useEffect, useRef, useState } from "react";
import type AppComponentProps from "../AppComponentProps.js";
import {
  isHeightChangedMessage,
  isSandboxReadyMessage,
  type RenderAppMessage,
} from "../ipc/ipc.js";
import MessageType from "../ipc/MessageType.js";

interface Props {
  iframeSrc: string;
  appName: string;
  appCode: string;
  appProps: AppComponentProps;
  settings: {
    locale: string;
    theme: Theme;
  };
  className?: string | undefined;
}
export default function Sandbox({
  iframeSrc,
  appName,
  appCode,
  appProps,
  settings: { locale, theme },
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
          payload: { appCode, appProps, settings: { locale, theme } },
        } satisfies RenderAppMessage,
        new URL(iframeRef.current.src, window.location.origin).origin,
      );
    }
  }, [sandboxReady, appCode, appProps, locale, theme]);

  return (
    <iframe
      key={appCode}
      ref={iframeRef}
      title={appName}
      src={iframeSrc}
      className={className}
    />
  );
}
