import { useEffect } from "react";
import { electronMainWorld } from "../electron/electron.js";
import { useNavigationStateStore } from "./useNavigationState.js";

export default function useElectronCloseHandler(): void {
  useEffect(() => {
    if (!electronMainWorld.isElectron) {
      return;
    }
    const { windowClose } = electronMainWorld;
    return windowClose.onCloseRequested(() => {
      const { exitWarningMessage } = useNavigationStateStore.getState();
      if (exitWarningMessage && !window.confirm(exitWarningMessage)) {
        return;
      }
      windowClose.confirmClose();
    });
  }, []);
}
