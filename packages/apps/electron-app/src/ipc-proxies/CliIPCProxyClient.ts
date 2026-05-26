import { ipcRenderer } from "electron";

export default function CliIPCProxyClient() {
  return {
    isInstalled: (): Promise<boolean> => ipcRenderer.invoke("cli.isInstalled"),
    install: (): Promise<boolean> => ipcRenderer.invoke("cli.install"),
  };
}
