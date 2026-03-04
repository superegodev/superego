import type { IntlShape } from "@formatjs/intl";
import type { MenuItemConstructorOptions } from "electron";
import { Menu } from "electron";
import cli from "./cli.js";

interface ActionHandlers {
  onNewWindow: () => void;
  onExportDatabase?: () => void;
}

export default function setApplicationMenu(
  intl: IntlShape,
  handlers: ActionHandlers,
) {
  const fileSubmenu: MenuItemConstructorOptions[] = [
    {
      label: intl.formatMessage({ defaultMessage: "New Window" }),
      accelerator: "CmdOrCtrl+N",
      click: handlers.onNewWindow,
    },
  ];
  if (handlers.onExportDatabase) {
    fileSubmenu.push({
      label: intl.formatMessage({ defaultMessage: "Export database" }),
      click: handlers.onExportDatabase,
    });
  }
  fileSubmenu.push({ type: "separator" }, { role: "close" });

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      { role: "appMenu" },
      {
        role: "fileMenu",
        submenu: fileSubmenu,
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
        ],
      },
    ]),
  );
}
