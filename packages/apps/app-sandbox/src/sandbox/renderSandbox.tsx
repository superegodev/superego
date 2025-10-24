import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import type { HeightChangedMessage, SandboxReadyMessage } from "../ipc/ipc.js";
import MessageType from "../ipc/MessageType.js";
import onHeightChanged from "./onHeightChanged.js";
import Sandbox from "./Sandbox/Sandbox.js";

export default function renderSandbox() {
  const rootElement = document.createElement("div");
  rootElement.id = "root";
  document.body.appendChild(rootElement);
  createRoot(rootElement).render(
    <StrictMode>
      <Sandbox />
    </StrictMode>,
  );

  window.parent.postMessage(
    {
      type: MessageType.SandboxReady,
      payload: null,
    } satisfies SandboxReadyMessage,
    "*",
  );

  onHeightChanged((height) => {
    // TODO: make a higher level class to send/handle messages
    window.parent.postMessage(
      {
        type: MessageType.HeightChanged,
        payload: { height },
      } satisfies HeightChangedMessage,
      "*",
    );
  });
}
