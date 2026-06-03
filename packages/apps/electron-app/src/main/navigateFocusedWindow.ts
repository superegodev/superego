import { BrowserWindow } from "electron";
import navigateWindowToHref from "./navigateWindowToHref.js";

export default function navigateFocusedWindow(href: string) {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    navigateWindowToHref(window, href);
  }
}
