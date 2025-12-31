import { useEffect } from "react";
import useSearchModalState from "./useSearchModalState.js";

export default function useSearchShortcut(): void {
  const { open } = useSearchModalState();
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isModifierKeyPressed = isMacos() ? event.metaKey : event.ctrlKey;
      if (isModifierKeyPressed && event.key === "k") {
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

function isMacos() {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("mac os") &&
    !userAgent.includes("iphone") &&
    !userAgent.includes("ipad")
  );
}
