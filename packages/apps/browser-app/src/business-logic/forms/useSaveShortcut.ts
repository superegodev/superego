import { useEffect } from "react";
import isMacos from "../../utils/isMacos.js";

export default function useSaveShortcut(
  formId: string,
  isDisabled: boolean,
): void {
  useEffect(() => {
    if (isDisabled) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      const isModifierKeyPressed = isMacos() ? event.metaKey : event.ctrlKey;
      if (isModifierKeyPressed && event.key.toLowerCase() === "s") {
        event.preventDefault();
        event.stopPropagation();
        const form = document.getElementById(formId);
        if (form instanceof HTMLFormElement) {
          form.requestSubmit();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [formId, isDisabled]);
}
