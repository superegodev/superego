import { useEffect } from "react";
import useSearchModalState from "./useSearchModalState.js";

export default function useSearchShortcut(): void {
  const { open } = useSearchModalState();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      if (modifierKey && event.key === "k") {
        event.preventDefault();
        open();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);
}
