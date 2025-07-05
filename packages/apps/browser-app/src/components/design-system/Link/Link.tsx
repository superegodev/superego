import type { RefAttributes } from "react";
import { type LinkProps, Link as LinkRAC } from "react-aria-components";
import type Route from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";

interface Props extends Omit<LinkProps, "href"> {
  to: Route;
}
export default function Link({
  to,
  ...props
}: Props & RefAttributes<HTMLAnchorElement>) {
  return <LinkRAC {...props} href={toHref(to)} />;
}
