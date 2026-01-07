import { ipcRenderer } from "electron";

export default function WindowCloseIPCProxyClient() {
  return {
    confirmClose: () => ipcRenderer.invoke("window-close-confirmed"),
    onCloseRequested: (callback: () => void) => {
      const handler = () => callback();
      ipcRenderer.on("window-close-requested", handler);
      return () => {
        ipcRenderer.removeListener("window-close-requested", handler);
      };
    },
  };
}
