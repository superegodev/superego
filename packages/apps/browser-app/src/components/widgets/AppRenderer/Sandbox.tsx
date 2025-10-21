import { useEffect, useRef, useState } from "react";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import type AppComponentProps from "./AppComponentProps.js";
import * as cs from "./AppRenderer.css.js";
import {
  isHeightChangedMessage,
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
  const globalData = useGlobalData();
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
          payload: { appCode, appProps, globalData },
        } satisfies RenderAppMessage,
        new URL(iframeRef.current.src, window.location.origin).origin,
      );
    }
  }, [sandboxReady, appCode, appProps, globalData]);

  return (
    <iframe
      key={appCode}
      ref={iframeRef}
      title={appName}
      // TODO: pass from outside?
      src="/app-sandbox.html"
      className={cs.Sandbox.root}
    />
  );
}
