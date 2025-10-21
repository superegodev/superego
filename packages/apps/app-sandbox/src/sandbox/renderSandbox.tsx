import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  type HeightChangedMessage,
  isRenderAppMessage,
  type SandboxReadyMessage,
} from "../ipc/ipc.js";
import MessageType from "../ipc/MessageType.js";
import onHeightChanged from "./onHeightChanged.js";
import Sandbox from "./Sandbox/Sandbox.js";

export default function renderSandbox() {
  const rootElement = document.createElement("div");
  rootElement.id = "root";
  document.body.appendChild(rootElement);
  const reactRoot = createRoot(rootElement);

  window.addEventListener("message", async ({ data: message }) => {
    if (isRenderAppMessage(message)) {
      reactRoot.render(
        <StrictMode>
          <Sandbox {...message.payload} />
        </StrictMode>,
      );
    }
  });
  window.parent.postMessage(
    {
      type: MessageType.SandboxReady,
      payload: null,
    } satisfies SandboxReadyMessage,
    "*",
  );

  onHeightChanged((height) => {
    window.parent.postMessage(
      {
        type: MessageType.HeightChanged,
        payload: { height },
      } satisfies HeightChangedMessage,
      "*",
    );
  });
}
