import { toHref, type Route } from "@superego/routing";
import type { RefAttributes } from "react";
import { type LinkProps, Link as LinkRAC } from "react-aria-components";

type Props =
  | (Omit<LinkProps, "href"> & { to: Route })
  | (LinkProps & { href: string });
export default function Link(props: Props & RefAttributes<HTMLAnchorElement>) {
  return (
    <LinkRAC {...props} href={"to" in props ? toHref(props.to) : props.href} />
  );
}
