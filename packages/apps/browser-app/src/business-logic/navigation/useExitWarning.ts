import { useEffect } from "react";
import useNavigationState from "./useNavigationState.js";

export default function useExitWarning(message: string | null): void {
  const { setExitWarningMessage } = useNavigationState();
  useEffect(() => {
    setExitWarningMessage(message);
    return () => setExitWarningMessage(null);
  }, [message, setExitWarningMessage]);
}
