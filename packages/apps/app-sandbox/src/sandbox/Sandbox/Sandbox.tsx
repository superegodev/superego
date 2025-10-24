import { useEffect, useState } from "react";
import importApp from "./importApp.js";
import "./Sandbox.css.js";
import { isRenderAppMessage } from "../../ipc/ipc.js";
import type AppComponent from "../../types/AppComponent.js";
import type AppComponentProps from "../../types/AppComponentProps.js";
import type IntlMessages from "../../types/IntlMessages.js";
import type Settings from "../../types/Settings.js";
import IntlMessagesContext from "../business-logic/intl-messages/IntlMessagesContext.js";
import SettingsContext from "../business-logic/settings/SettingsContext.js";
import useApplyTheme from "../business-logic/theme/useApplyTheme.js";

export default function Sandbox() {
  const stuff = useStuff();
  // TODO: error boundary around App
  return stuff ? (
    <SettingsContext.Provider value={stuff.settings}>
      <IntlMessagesContext.Provider value={stuff.intlMessages}>
        <stuff.App {...stuff.appProps} />
        <ApplyTheme />
      </IntlMessagesContext.Provider>
    </SettingsContext.Provider>
  ) : null;
}

// TODO: put into Root component alongside App and error boundary
function ApplyTheme() {
  useApplyTheme();
  return null;
}

// TODO: rename
interface Stuff {
  App: AppComponent;
  appProps: AppComponentProps;
  settings: Settings;
  intlMessages: IntlMessages;
}
function useStuff(): Stuff | null {
  const [stuff, setStuff] = useState<Stuff | null>(null);

  useEffect(() => {
    const handleMessage = async ({ data: message }: MessageEvent) => {
      if (isRenderAppMessage(message)) {
        const { appCode, appProps, settings, intlMessages } = message.payload;
        // TODO: handle errors importing app code
        const App = await importApp(appCode);
        setStuff({ App, appProps, settings, intlMessages });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return stuff;
}
