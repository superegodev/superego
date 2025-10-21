import { useEffect, useState } from "react";
import type AppComponent from "../../AppComponent.js";
import type { RenderAppMessage } from "../../ipc/ipc.js";
import useApplyTheme from "../hooks/useApplyTheme.js";
import importApp from "./importApp.js";
import "./Sandbox.css.js";

export default function Sandbox({
  appCode,
  appProps,
  settings,
}: RenderAppMessage["payload"]) {
  useApplyTheme(settings.theme);
  const [App, setApp] = useState<AppComponent | null>(null);

  useEffect(() => {
    importApp(appCode).then((AppComponent) => setApp(() => AppComponent));
  }, [appCode]);

  // TODO: error boundary
  return App ? <App {...appProps} /> : null;
}
