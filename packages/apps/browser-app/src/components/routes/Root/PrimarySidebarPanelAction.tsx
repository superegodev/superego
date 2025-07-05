import type { ReactNode } from "react";
import type Route from "../../../business-logic/navigation/Route.js";
import Button from "../../design-system/Button/Button.js";
import Link from "../../design-system/Link/Link.js";
import * as cs from "./Root.css.js";

type Props =
  | {
      type: "button";
      onPress: () => void;
      to?: never;
      children: ReactNode;
    }
  | {
      type: "link";
      onPress?: never;
      to: Route;
      children: ReactNode;
    };
export default function PrimarySidebarPanelAction({
  type,
  children,
  to,
  onPress,
}: Props) {
  return type === "link" ? (
    <Link to={to} className={cs.PrimarySidebarPanelAction.root[type]}>
      {children}
    </Link>
  ) : (
    <Button
      variant="invisible"
      onPress={onPress}
      className={cs.PrimarySidebarPanelAction.root[type]}
    >
      {children}
    </Button>
  );
}
