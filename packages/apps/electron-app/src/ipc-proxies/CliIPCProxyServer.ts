import type { IntlShape } from "@formatjs/intl";
import { ipcMain } from "electron";
import cli from "../main/cli.js";

export default class CliIPCProxyServer {
  private intl: IntlShape;
  private onInstallationStateChange: () => void;

  constructor(intl: IntlShape, onInstallationStateChange: () => void) {
    this.intl = intl;
    this.onInstallationStateChange = onInstallationStateChange;
  }

  start() {
    ipcMain.handle("cli.isInstalled", () => cli.isInstalled());
    ipcMain.handle("cli.install", () => {
      cli.install(this.intl);
      this.onInstallationStateChange();
      return cli.isInstalled();
    });
  }
}
