import { BrowserWindow } from "electron";

export default function navigateFocusedWindow(href: string) {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    navigateWindowToHref(window, href);
  }
}

export function navigateWindowToHref(window: BrowserWindow, href: string) {
  const navigate = () => {
    window.webContents.postMessage("NavigationRequested", {
      type: "NavigationRequested",
      href,
    });
  };
  if (window.webContents.isLoadingMainFrame()) {
    window.webContents.once("did-finish-load", navigate);
  } else {
    navigate();
  }
}
