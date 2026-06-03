import { resolve } from "node:path";
import { fromDeepLink, toHref } from "@superego/routing";
import { app, BrowserWindow } from "electron";
import createWindow from "../createWindow.js";
import { navigateWindowToHref } from "../navigateFocusedWindow.js";

const DEEP_LINK_PROTOCOL = "superego";

export default function registerDeepLinks(): {
  navigateToPendingDeepLink(): void;
} {
  registerDeepLinkProtocol();
  let pendingDeepLink = findDeepLink(process.argv);

  app
    .on("second-instance", (_event, commandLine) => {
      const deepLink = findDeepLink(commandLine);
      if (deepLink) {
        handleDeepLink(deepLink);
      }
    })
    .on("open-url", (event, deepLink) => {
      event.preventDefault();
      handleDeepLink(deepLink);
    });

  return {
    navigateToPendingDeepLink() {
      if (pendingDeepLink) {
        navigateToDeepLink(pendingDeepLink);
        pendingDeepLink = undefined;
      }
    },
  };

  function handleDeepLink(deepLink: string): void {
    if (!app.isReady()) {
      pendingDeepLink = deepLink;
      return;
    }
    navigateToDeepLink(deepLink);
  }
}

function registerDeepLinkProtocol(): void {
  if (process.defaultApp && process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(DEEP_LINK_PROTOCOL, process.execPath, [
      resolve(process.argv[1]!),
    ]);
  } else {
    app.setAsDefaultProtocolClient(DEEP_LINK_PROTOCOL);
  }
}

function findDeepLink(arguments_: string[]): string | undefined {
  return arguments_.find((argument) =>
    argument.startsWith(`${DEEP_LINK_PROTOCOL}://`),
  );
}

function navigateToDeepLink(deepLink: string): void {
  const route = fromDeepLink(deepLink);
  if (route === null) {
    return;
  }
  const window = BrowserWindow.getFocusedWindow() ?? createWindow();
  if (window.isMinimized()) {
    window.restore();
  }
  window.focus();
  navigateWindowToHref(window, toHref(route));
}
