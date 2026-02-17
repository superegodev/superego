import { existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import type { IntlShape } from "@formatjs/intl";
import { app, dialog } from "electron";

const INSTALL_DIR = join(app.getPath("home"), ".local", "bin");
const INSTALL_PATH = join(INSTALL_DIR, "superego");
const CLI_PATH = join(process.resourcesPath, "superego.js");

export function isCLIInstalled(): boolean {
  return existsSync(INSTALL_PATH);
}

export function installCLI(intl: IntlShape): void {
  mkdirSync(dirname(INSTALL_PATH), { recursive: true });
  symlinkSync(CLI_PATH, INSTALL_PATH);

  dialog.showMessageBox({
    type: "info",
    message: intl.formatMessage({
      defaultMessage: "CLI installed",
    }),
    detail: intl.formatMessage(
      {
        defaultMessage:
          "The CLI has been installed at {path}. Make sure {dir} is in your PATH.",
      },
      {
        path: INSTALL_PATH,
        dir: INSTALL_PATH.replace(/\/[^/]+$/, ""),
      },
    ),
    buttons: ["OK"],
  });
}

export function uninstallCLI(intl: IntlShape): void {
  rmSync(INSTALL_PATH, { force: true });

  dialog.showMessageBox({
    type: "info",
    message: intl.formatMessage({ defaultMessage: "CLI uninstalled" }),
    detail: intl.formatMessage(
      { defaultMessage: "The CLI has been removed from {path}." },
      { path: INSTALL_PATH },
    ),
    buttons: ["OK"],
  });
}
