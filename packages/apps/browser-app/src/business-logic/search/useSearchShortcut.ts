import { useEffect } from "react";
import useSearchModalState from "./useSearchModalState.js";

export default function useSearchShortcut(): void {
  const { setIsOpen } = useSearchModalState();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isModifierKeyPressed = isMacos() ? event.metaKey : event.ctrlKey;
      if (isModifierKeyPressed && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsOpen]);
}

function isMacos() {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("mac os") &&
    !userAgent.includes("iphone") &&
    !userAgent.includes("ipad")
  );
}
