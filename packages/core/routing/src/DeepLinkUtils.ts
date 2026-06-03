import type Route from "./Route.js";
import { toHref, tryFromHref } from "./RouteUtils.js";

const DEEP_LINK_PROTOCOL = "superego";

export function toDeepLink(route: Route): string {
  return `${DEEP_LINK_PROTOCOL}://${toHref(route)}`;
}

export function fromDeepLink(deepLink: string): Route | null {
  const href = toHrefFromDeepLink(deepLink);
  return href === null ? null : tryFromHref(href);
}

export function toHrefFromDeepLink(deepLink: string): string | null {
  let url: URL;
  try {
    url = new URL(deepLink);
  } catch {
    return null;
  }

  if (url.protocol !== `${DEEP_LINK_PROTOCOL}:`) {
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
