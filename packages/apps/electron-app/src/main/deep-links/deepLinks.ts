import { resolve } from "node:path";
import { app } from "electron";

const PROTOCOL = "superego";

export function registerDeepLinkProtocol(): void {
  if (process.defaultApp && process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [
      resolve(process.argv[1]!),
    ]);
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL);
  }
}

export function toHrefFromDeepLink(deepLink: string): string | null {
  let url: URL;
  try {
    url = new URL(deepLink);
  } catch {
    return null;
  }

  if (url.protocol !== `${PROTOCOL}:`) {
    return null;
  }

  const pathname =
    url.hostname === "" ? url.pathname : `/${url.hostname}${url.pathname}`;
  const href = `${pathname}${url.search}`;
  if (!href.startsWith("/") || href.startsWith("//")) {
    return null;
  }
  return href;
}
