import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  isRenderAppMessage,
  MessageType,
  type SandboxReadyMessage,
} from "../ipc.js";
import importApp from "./importApp.js";
import registerDependencies from "./registerDependencies.js";

const rootElement = document.createElement("div");
rootElement.id = "root";
document.body.appendChild(rootElement);
const reactRoot = createRoot(rootElement);

window.addEventListener("message", async ({ data: message }) => {
  if (isRenderAppMessage(message)) {
    try {
      registerDependencies();
      const App = await importApp(message.payload.appCode);
      reactRoot.render(
        <StrictMode>
          <App {...message.payload.appProps} />
        </StrictMode>,
      );
      // TODO: flushSync and signal app rendered?
    } catch (error: unknown) {
      // TODO: show error
      console.error(error);
    }
  }
});
window.parent.postMessage(
  {
    type: MessageType.SandboxReady,
    payload: null,
  } satisfies SandboxReadyMessage,
  "*",
);
