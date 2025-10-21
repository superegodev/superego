import { useEffect, useState } from "react";
import { useLocale } from "react-aria-components";
import { IntlProvider } from "react-intl";
import { GlobalDataProvider } from "../../../../business-logic/backend/GlobalData.js";
import messages from "../../../../translations/compiled/en.json" with {
  type: "json",
};
import type AppComponent from "../AppComponent.js";
import type { RenderAppMessage } from "../ipc.js";
import useApplyTheme from "./hooks/useApplyTheme.js";
import importApp from "./importApp.js";

export default function SandboxApp({
  appCode,
  appProps,
  globalData,
}: RenderAppMessage["payload"]) {
  const { locale } = useLocale();

  useApplyTheme(globalData.globalSettings.appearance.theme);

  const [App, setApp] = useState<AppComponent | null>(null);
  useEffect(() => {
    importApp(appCode).then((AppComponent) => setApp(() => AppComponent));
  }, [appCode]);

  // TODO: error boundary for App
  return App ? (
    <GlobalDataProvider value={globalData}>
      <IntlProvider messages={messages} locale={locale} defaultLocale="en">
        <App {...appProps} />
      </IntlProvider>
    </GlobalDataProvider>
  ) : null;
}
