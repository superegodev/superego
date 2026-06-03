import { app, BrowserWindow } from "electron";
import createWindow from "./createWindow.js";
import {
  registerDeepLinkProtocol,
  toHrefFromDeepLink,
} from "./deep-links/deepLinks.js";
import { navigateWindowToHref } from "./navigateFocusedWindow.js";
import onReady from "./onReady.js";
import registerAppSandboxProtocol from "./registerAppSandboxProtocol.js";

registerAppSandboxProtocol();
registerDeepLinkProtocol();

let pendingDeepLink = process.argv.find((argument) =>
  argument.startsWith("superego://"),
);

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app
    .on("ready", () => {
      onReady();
      if (pendingDeepLink) {
        navigateToDeepLink(pendingDeepLink);
        pendingDeepLink = undefined;
      }
    })
    .on("second-instance", (_event, commandLine) => {
      const deepLink = commandLine.find((argument) =>
        argument.startsWith("superego://"),
      );
      if (deepLink) {
        handleDeepLink(deepLink);
      }
    })
    .on("open-url", (event, deepLink) => {
      event.preventDefault();
      handleDeepLink(deepLink);
    })
    .on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    })
    .on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    })
    .on("web-contents-created", (_event, contents) => {
      contents.on("will-navigate", (event) => {
        // Disable navigation. BrowserApp doesn't use navigation, so we don't
        // actually expect any navigation attempt. Still, if they occur, they
        // are probably erroneous and we want to prevent them.
        event.preventDefault();
      });
    });
}

function handleDeepLink(deepLink: string): void {
  if (!app.isReady()) {
    pendingDeepLink = deepLink;
    return;
  }
  navigateToDeepLink(deepLink);
}

function navigateToDeepLink(deepLink: string): void {
  const href = toHrefFromDeepLink(deepLink);
  if (href === null) {
    return;
  }
  const window = BrowserWindow.getFocusedWindow() ?? createWindow();
  if (window.isMinimized()) {
    window.restore();
  }
  window.focus();
  navigateWindowToHref(window, href);
}
