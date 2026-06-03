import { fromHref, RouteName, type Route } from "@superego/routing";

interface CurrentLocation {
  href: string;
  protocol: string;
}

export default function getInitialRoute(location: CurrentLocation): Route {
  if (location.protocol === "file:") {
    return { name: RouteName.Ask };
  }
  return fromHref(location.href);
}
