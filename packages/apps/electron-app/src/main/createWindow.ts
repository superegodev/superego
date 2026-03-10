import { join } from "node:path";
import { BrowserWindow, Menu, shell } from "electron";

export default function createWindow(isDevenv = false): BrowserWindow {
  const win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/index.cjs"),
    },
    icon:
      process.platform === "linux"
        ? join(import.meta.dirname, "../../assets/icon.png")
        : undefined,
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    try {
      if (["https:", "http:"].includes(new URL(url).protocol)) {
        shell.openExternal(url);
      } else {
        console.warn(
          `Blocked attempt to open URL with unsafe protocol: ${url}`,
        );
      }
    } catch {
      console.warn(`Blocked attempt to open invalid URL: ${url}`);
    }
    return { action: "deny" };
  });

  win.webContents.on("context-menu", (_event, params) => {
    const menu = Menu.buildFromTemplate([
      { role: "cut", enabled: params.editFlags.canCut },
      { role: "copy", enabled: params.editFlags.canCopy },
      { role: "paste", enabled: params.editFlags.canPaste },
      { role: "selectAll", enabled: params.editFlags.canSelectAll },
    ]);
    menu.popup();
  });

  win.on("close", (event) => {
    event.preventDefault();
    win.webContents.send("window-close-requested");
  });

  win.maximize();
  win.loadFile(
    join(
      import.meta.dirname,
      isDevenv ? "../renderer/index-devenv.html" : "../renderer/index.html",
    ),
  );
  win.show();

  return win;
}
