import type { IntlShape } from "@formatjs/intl";
import { Menu } from "electron";
import { installCLI, isCLIInstalled, uninstallCLI } from "./cli.js";

interface ActionHandlers {
  onNewWindow: () => void;
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
        submenu: [
          {
            label: intl.formatMessage({ defaultMessage: "New Window" }),
            accelerator: "CmdOrCtrl+N",
            click: handlers.onNewWindow,
          },
          { type: "separator" },
          { role: "close" },
        ],
      },
      { role: "editMenu" },
      { role: "viewMenu" },
      { role: "windowMenu" },
      {
        label: intl.formatMessage({ defaultMessage: "Developer" }),
        submenu: [
          {
            label: isCLIInstalled()
              ? intl.formatMessage({ defaultMessage: "Uninstall CLI" })
              : intl.formatMessage({ defaultMessage: "Install CLI" }),
            click: () => {
              if (isCLIInstalled()) {
                uninstallCLI(intl);
              } else {
                installCLI(intl);
              }
              setApplicationMenu(intl, handlers);
            },
          },
        ],
      },
    ]),
  );
}
