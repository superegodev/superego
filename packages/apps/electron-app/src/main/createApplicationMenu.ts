import { Menu, MenuItem } from "electron";
import getIntl from "./translations/getIntl.js";

interface ActionHandlers {
  onNewWindow: () => void;
}
export default function createApplicationMenu({ onNewWindow }: ActionHandlers) {
  const intl = getIntl();
  const menu = Menu.getApplicationMenu();
  const fileMenu = menu?.items.find(
    (item) => item.role === ("filemenu" as typeof item.role),
  );
  fileMenu?.submenu?.append(
    new MenuItem({
      label: intl.formatMessage({ defaultMessage: "New Window" }),
      accelerator: "CmdOrCtrl+N",
      click: onNewWindow,
    }),
  );
  Menu.setApplicationMenu(menu);
}
