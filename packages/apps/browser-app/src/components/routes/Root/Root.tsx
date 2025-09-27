import { useLocale } from "react-aria";
import useApplyTheme from "../../../business-logic/theme/useApplyTheme.js";
import Shell from "../../design-system/Shell/Shell.js";
import { ToastRegion } from "../../widgets/ToastRegion/ToastRegion.js";
import MainPanel from "./MainPanel.js";
import PrimarySidebarPanel from "./PrimarySidebarPanel.js";

export default function Root() {
  const { locale, direction } = useLocale();
  useApplyTheme();
  return (
    <>
      <Shell locale={locale} direction={direction}>
        <PrimarySidebarPanel />
        <MainPanel />
      </Shell>
      <ToastRegion />
    </>
  );
}
