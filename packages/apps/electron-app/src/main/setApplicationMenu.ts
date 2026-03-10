import type { IntlShape } from "@formatjs/intl";
import { BrowserWindow, Menu } from "electron";
import { compact } from "es-toolkit";
import cli from "./cli.js";

interface ActionHandlers {
  onNewWindow: () => void;
  onExportDatabase?: () => void;
}

export default function setApplicationMenu(
  intl: IntlShape,
  handlers: ActionHandlers,
) {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      { role: "appMenu" },
      {
        role: "fileMenu",
        submenu: compact([
          {
            label: intl.formatMessage({ defaultMessage: "New Window" }),
            accelerator: "CmdOrCtrl+N",
            click: handlers.onNewWindow,
          },
          handlers.onExportDatabase
            ? {
                label: intl.formatMessage({
                  defaultMessage: "Export database",
                }),
                click: handlers.onExportDatabase,
              }
            : null,
          { type: "separator" },
          { role: "close" },
        ]),
      },
      { role: "editMenu" },
      { role: "viewMenu" },
      { role: "windowMenu" },
      {
        label: intl.formatMessage({ defaultMessage: "Developer" }),
        submenu: [
          {
            label: cli.isInstalled()
              ? intl.formatMessage({ defaultMessage: "Uninstall CLI" })
              : intl.formatMessage({ defaultMessage: "Install CLI" }),
            click: () => {
              if (cli.isInstalled()) {
                cli.uninstall(intl);
              } else {
                cli.install(intl);
              }
              setApplicationMenu(intl, handlers);
            },
          },
          { type: "separator" },
          {
            label: intl.formatMessage({ defaultMessage: "Background Jobs" }),
            click: () => {
              BrowserWindow.getFocusedWindow()?.webContents.postMessage(
                "NavigationRequested",
                { type: "NavigationRequested", href: "/background-jobs" },
              );
            },
          },
        ],
      },
    ]),
  );
}
