import { useEffect, useRef, useState } from "react";
import type AppComponentProps from "./AppComponentProps.js";
import {
  isSandboxReadyMessage,
  MessageType,
  type RenderAppMessage,
} from "./ipc.js";

interface Props {
  appName: string;
  appCode: string;
  appProps: AppComponentProps;
}
export default function Sandbox({ appName, appCode, appProps }: Props) {
  const [sandboxReady, setSandboxReady] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    const handleSandboxMessage = ({ data }: MessageEvent) => {
      if (isSandboxReadyMessage(data)) {
        setSandboxReady(true);
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
          payload: { appCode, appProps },
        } satisfies RenderAppMessage,
        new URL(iframeRef.current.src, window.location.origin).origin,
      );
    }
  }, [sandboxReady, appCode, appProps]);

  return (
    <iframe
      key={appCode}
      ref={iframeRef}
      title={appName}
      src="/app-sandbox.html"
    />
  );
}
