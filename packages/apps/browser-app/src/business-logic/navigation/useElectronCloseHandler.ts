import { useEffect } from "react";
import { useNavigationStateStore } from "./useNavigationState.js";

interface WindowCloseHandler {
  confirmClose(): Promise<void>;
  onCloseRequested(callback: () => void): () => void;
}

declare global {
  interface Window {
    windowClose?: WindowCloseHandler;
  }
}

export default function useElectronCloseHandler(): void {
  useEffect(() => {
    return window.windowClose
      ? window.windowClose.onCloseRequested(() => {
          const { exitWarningMessage } = useNavigationStateStore.getState();
          if (exitWarningMessage && !window.confirm(exitWarningMessage)) {
            return;
          }
          window.windowClose?.confirmClose();
        })
      : undefined;
  }, []);
}
