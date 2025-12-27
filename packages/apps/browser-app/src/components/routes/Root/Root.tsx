import { useLocale } from "react-aria";
import useSearchShortcut from "../../../business-logic/search/useSearchShortcut.js";
import useApplyTheme from "../../../business-logic/theme/useApplyTheme.js";
import Shell from "../../design-system/Shell/Shell.js";
import SearchModal from "../../widgets/SearchModal/SearchModal.js";
import { ToastRegion } from "../../widgets/ToastRegion/ToastRegion.js";
import MainPanel from "./MainPanel.js";
import PrimarySidebarPanel from "./PrimarySidebarPanel.js";

export default function Root() {
  const { locale, direction } = useLocale();
  useApplyTheme();
  useSearchShortcut();
  return (
    <>
      <Shell locale={locale} direction={direction}>
        <PrimarySidebarPanel />
        <MainPanel />
      </Shell>
      <SearchModal />
      <ToastRegion />
    </>
  );
}
