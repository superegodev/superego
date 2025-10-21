import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  type HeightChangedMessage,
  isRenderAppMessage,
  type SandboxReadyMessage,
} from "../ipc/ipc.js";
import MessageType from "../ipc/MessageType.js";
import IntlMessagesContext from "./business-logic/intl-messages/IntlMessagesContext.js";
import SettingsContext from "./business-logic/settings/SettingsContext.js";
import onHeightChanged from "./onHeightChanged.js";
import Sandbox from "./Sandbox/Sandbox.js";

export default function renderSandbox() {
  const rootElement = document.createElement("div");
  rootElement.id = "root";
  document.body.appendChild(rootElement);
  const reactRoot = createRoot(rootElement);

  window.addEventListener("message", async ({ data: message }) => {
    if (isRenderAppMessage(message)) {
      const { appCode, appProps, settings, intlMessages } = message.payload;
      reactRoot.render(
        <StrictMode>
          <SettingsContext.Provider value={settings}>
            <IntlMessagesContext.Provider value={intlMessages}>
              <Sandbox appCode={appCode} appProps={appProps} />
            </IntlMessagesContext.Provider>
          </SettingsContext.Provider>
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
