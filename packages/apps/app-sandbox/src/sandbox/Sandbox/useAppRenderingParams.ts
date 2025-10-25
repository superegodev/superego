import { useEffect, useRef, useState } from "react";
import MessageType from "../../ipc/MessageType.js";
import type SandboxIpc from "../../ipc/SandboxIpc.js";
import type AppComponent from "../../types/AppComponent.js";
import type AppComponentProps from "../../types/AppComponentProps.js";
import type IntlMessages from "../../types/IntlMessages.js";
import type Settings from "../../types/Settings.js";
import importApp from "./importApp.js";

type AppRenderingParams =
  | {
      appProps: AppComponentProps;
      settings: Settings;
      intlMessages: IntlMessages;
      App: AppComponent;
      appImportingError: null;
    }
  | {
      appProps: AppComponentProps;
      settings: Settings;
      intlMessages: IntlMessages;
      App: null;
      appImportingError: any;
    };
export default function useAppRenderingParams(
  sandboxIpc: SandboxIpc,
): AppRenderingParams | null {
  const [latestStuff, setLatestStuff] = useState<AppRenderingParams | null>(
    null,
  );

  const latestImportIdRef = useRef<string>(null);

  useEffect(
    () =>
      sandboxIpc.registerHandlers({
        [MessageType.RenderApp]: async ({
          payload: { appCode, appProps, settings, intlMessages },
        }) => {
          const importId = crypto.randomUUID();
          latestImportIdRef.current = importId;
          try {
            const App = await importApp(appCode);
            if (latestImportIdRef.current === importId) {
              setLatestStuff({
                appProps,
                settings,
                intlMessages,
                App,
                appImportingError: null,
              });
            }
          } catch (appImportingError) {
            if (latestImportIdRef.current === importId) {
              setLatestStuff({
                appProps,
                settings,
                intlMessages,
                App: null,
                appImportingError,
              });
            }
          }
        },
      }),
    [sandboxIpc],
  );

  return latestStuff;
}
