import { useEffect } from "react";
import useNavigationState from "./useNavigationState.js";

export default function useExitWarning(message: string | null): void {
  const { setExitWarningMessage } = useNavigationState();
  useEffect(() => {
    setExitWarningMessage(shouldShowExitWarning() ? message : null);
    return () => setExitWarningMessage(null);
  }, [message, setExitWarningMessage]);
}

function shouldShowExitWarning(): boolean {
  return import.meta.env.PROD || navigator.webdriver;
}
