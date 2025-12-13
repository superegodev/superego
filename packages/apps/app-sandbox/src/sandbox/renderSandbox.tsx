import { QueryClient } from "@tanstack/react-query";
import { StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import MessageType from "../ipc/MessageType.js";
import SandboxIpc from "../ipc/SandboxIpc.js";
import Backend from "./business-logic/backend/Backend.js";
import onHeightChanged from "./onHeightChanged.js";
import Sandbox from "./Sandbox/Sandbox.js";

export default function renderSandbox() {
  const sandboxIpc = new SandboxIpc(window.parent, window);
  const backend = new Backend(sandboxIpc);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, networkMode: "always" },
      mutations: { networkMode: "always" },
    },
  });

  onHeightChanged((height) => {
    sandboxIpc.send({
      type: MessageType.HeightChanged,
      payload: { height },
    });
  });

  const rootElement = document.createElement("div");
  rootElement.id = "root";
  document.body.appendChild(rootElement);
  flushSync(() =>
    createRoot(rootElement).render(
      <StrictMode>
        <Sandbox
          sandboxIpc={sandboxIpc}
          backend={backend}
          queryClient={queryClient}
        />
      </StrictMode>,
    ),
  );

  sandboxIpc.send({
    type: MessageType.SandboxReady,
    payload: null,
  });
}
