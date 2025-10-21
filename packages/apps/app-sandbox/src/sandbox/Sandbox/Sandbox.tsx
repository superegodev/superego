import { useEffect, useState } from "react";
import importApp from "./importApp.js";
import "./Sandbox.css.js";
import type AppComponent from "../../types/AppComponent.js";
import type AppComponentProps from "../../types/AppComponentProps.js";
import useApplyTheme from "../business-logic/theme/useApplyTheme.js";

interface Props {
  appCode: string;
  appProps: AppComponentProps;
}
export default function Sandbox({ appCode, appProps }: Props) {
  useApplyTheme();

  const [App, setApp] = useState<AppComponent | null>(null);

  useEffect(() => {
    importApp(appCode).then((AppComponent) => setApp(() => AppComponent));
  }, [appCode]);

  // TODO: error boundary
  return App ? <App {...appProps} /> : null;
}
