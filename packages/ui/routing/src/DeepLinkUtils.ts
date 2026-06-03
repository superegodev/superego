import deepLinkProtocol from "./deepLinkProtocol.js";
import type Route from "./Route.js";
import { fromHref, toHref } from "./RouteUtils.js";

export function toDeepLink(route: Route): string {
  return `${deepLinkProtocol}://${toHref(route)}`;
}

export function fromDeepLink(deepLink: string): Route | null {
  const href = toHrefFromDeepLink(deepLink);
  return href === null ? null : fromHref(href);
}

export function toHrefFromDeepLink(deepLink: string): string | null {
  let url: URL;
  try {
    url = new URL(deepLink);
  } catch {
    return null;
  }

  if (url.protocol !== `${deepLinkProtocol}:`) {
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
