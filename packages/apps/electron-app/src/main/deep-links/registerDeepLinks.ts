import { resolve } from "node:path";
import { deepLinkProtocol, fromDeepLink, toHref } from "@superego/routing";
import { app, BrowserWindow } from "electron";
import navigateWindowToHref from "../navigateWindowToHref.js";

export default function registerDeepLinks(): {
  navigateToPendingDeepLink(window: BrowserWindow): void;
} {
  registerDeepLinkProtocol();
  let pendingDeepLink = findDeepLink(process.argv);

  app
    .on("second-instance", (_event, commandLine) => {
      const deepLink = findDeepLink(commandLine);
      if (deepLink) {
        handleDeepLink(deepLink);
        return;
      }
      focusWindow(getNavigableWindow());
    })
    .on("open-url", (event, deepLink) => {
      event.preventDefault();
      handleDeepLink(deepLink);
    });

  return {
    navigateToPendingDeepLink(window) {
      if (pendingDeepLink) {
        navigateToDeepLink(pendingDeepLink, window);
        pendingDeepLink = undefined;
      }
    },
  };

  function handleDeepLink(deepLink: string): void {
    if (!app.isReady()) {
      pendingDeepLink = deepLink;
      return;
    }
    navigateToDeepLink(deepLink, getNavigableWindow());
  }
}

function registerDeepLinkProtocol(): void {
  if (process.defaultApp && process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(deepLinkProtocol, process.execPath, [
      resolve(process.argv[1]!),
    ]);
  } else {
    app.setAsDefaultProtocolClient(deepLinkProtocol);
  }
}

function findDeepLink(arguments_: string[]): string | undefined {
  return arguments_.find((argument) =>
    argument.startsWith(`${deepLinkProtocol}://`),
  );
}

function getNavigableWindow(): BrowserWindow | undefined {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0];
}

function focusWindow(window: BrowserWindow | undefined): void {
  if (!window) {
    return;
  }

  if (window.isMinimized()) {
    window.restore();
  }
  window.focus();
}

function navigateToDeepLink(
  deepLink: string,
  window: BrowserWindow | undefined,
): void {
  if (!window) {
    return;
  }
  focusWindow(window);

  const route = fromDeepLink(deepLink);
  if (route === null) {
    return;
  }
  navigateWindowToHref(window, toHref(route));
}
