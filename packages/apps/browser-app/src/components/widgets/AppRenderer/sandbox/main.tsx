import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  type HeightChangedMessage,
  isRenderAppMessage,
  MessageType,
  type SandboxReadyMessage,
} from "../ipc.js";
import registerDependencies from "./registerDependencies.js";
import SandboxApp from "./SandboxApp.js";
import "./main.css.js";
import onHeightChanged from "./onHeightChanged.js";

const rootElement = document.createElement("div");
rootElement.id = "root";
document.body.appendChild(rootElement);
const reactRoot = createRoot(rootElement);
registerDependencies();

window.addEventListener("message", async ({ data: message }) => {
  if (isRenderAppMessage(message)) {
    reactRoot.render(
      <StrictMode>
        <SandboxApp {...message.payload} />
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
