import baseX from "base-x";
import type Route from "./Route.js";

const base58Alphabet =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bs58 = baseX(base58Alphabet);
const hrefPrefix = "/#route=";

export function toHref(route: Route): string {
  const jsonRoute = JSON.stringify(route);
  const b58Route = bs58.encode(new TextEncoder().encode(jsonRoute));
  return `${hrefPrefix}${b58Route}`;
}

export function fromHref(href: string): Route {
  try {
    if (!href.startsWith(hrefPrefix)) {
      throw new Error();
    }
    const b58Route = href.slice(hrefPrefix.length);
    const jsonRoute = new TextDecoder().decode(bs58.decode(b58Route));
    return JSON.parse(jsonRoute);
  } catch {
    throw new Error(`Href ${href} cannot be converted into a Route object`);
  }
}
