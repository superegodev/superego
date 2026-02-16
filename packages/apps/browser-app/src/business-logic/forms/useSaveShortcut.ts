import { useEffect } from "react";

export default function useSaveShortcut(
  formId: string,
  isDisabled: boolean,
): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isModifierKeyPressed = isMacos() ? event.metaKey : event.ctrlKey;
      if (isModifierKeyPressed && event.key === "s") {
        event.preventDefault();
        if (isDisabled) return;
        const form = document.getElementById(formId);
        if (form instanceof HTMLFormElement) {
          form.requestSubmit();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [formId, isDisabled]);
}

function isMacos() {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("mac os") &&
    !userAgent.includes("iphone") &&
    !userAgent.includes("ipad")
  );
}
