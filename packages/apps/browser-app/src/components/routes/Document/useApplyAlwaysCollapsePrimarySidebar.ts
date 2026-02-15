import { useEffect } from "react";
import useShell from "../../../business-logic/navigation/useShell.js";

export default function useApplyAlwaysCollapsePrimarySidebar(
  alwaysCollapsePrimarySidebar?: boolean,
) {
  const { setPrimarySidebarCollapse } = useShell();
  useEffect(() => {
    if (!alwaysCollapsePrimarySidebar) {
      return;
    }
    setPrimarySidebarCollapse("Always");
    return () => setPrimarySidebarCollapse("SmallScreens");
  }, [alwaysCollapsePrimarySidebar, setPrimarySidebarCollapse]);
}
