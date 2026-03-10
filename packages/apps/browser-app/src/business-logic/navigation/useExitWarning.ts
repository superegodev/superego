import { useEffect } from "react";
import useNavigationState from "./useNavigationState.js";

export default function useExitWarning(message: string | null): void {
  const { setExitWarningMessage } = useNavigationState();
  useEffect(() => {
    setExitWarningMessage(import.meta.env.PROD ? message : null);
    return () => setExitWarningMessage(null);
  }, [message, setExitWarningMessage]);
}
