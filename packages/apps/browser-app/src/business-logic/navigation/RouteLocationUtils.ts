import { fromHref, toHref, type Route } from "@superego/routing";

interface BrowserLocation {
  href: string;
  hash: string;
}

export function fromBrowserLocation(
  location: BrowserLocation,
  useHashRouting: boolean,
): Route {
  if (useHashRouting) {
    return fromHref(location.hash === "" ? "/" : location.hash.slice(1));
  }
  return fromHref(location.href);
}

export function toBrowserHref(route: Route, useHashRouting: boolean): string {
  const href = toHref(route);
  return useHashRouting ? `#${href}` : href;
}
