import { BrowserWindow } from "electron";

export default function navigateFocusedWindow(href: string) {
  BrowserWindow.getFocusedWindow()?.webContents.postMessage(
    "NavigationRequested",
    { type: "NavigationRequested", href },
  );
}
