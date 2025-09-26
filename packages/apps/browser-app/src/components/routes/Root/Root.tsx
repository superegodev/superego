import { useLocale } from "react-aria";
import useApplyTheme from "../../../business-logic/theme/useApplyTheme.js";
import Shell from "../../design-system/Shell/Shell.js";
import LoadDemoDataButton from "../../widgets/LoadDemoDataButton/LoadDemoDataButton.js";
import { ToastRegion } from "../../widgets/ToastRegion/ToastRegion.js";
import MainPanel from "./MainPanel.js";
import PrimarySidebarPanel from "./PrimarySidebarPanel.js";

interface Props {
  loadDemoData?: () => Promise<void>;
}
export default function Root({ loadDemoData }: Props) {
  const { locale, direction } = useLocale();
  useApplyTheme();
  return (
    <>
      <Shell locale={locale} direction={direction}>
        <PrimarySidebarPanel />
        <MainPanel />
      </Shell>
      {import.meta.env["VITE_IS_DEMO"] === "true" && loadDemoData ? (
        <LoadDemoDataButton loadDemoData={loadDemoData} />
      ) : null}
      <ToastRegion />
    </>
  );
}
