import type { ReactNode } from "react";
import type Route from "../../../business-logic/navigation/Route.js";
import useShell from "../../../business-logic/navigation/useShell.js";
import classnames from "../../../utils/classnames.js";
import Button from "../../design-system/Button/Button.js";
import Link from "../../design-system/Link/Link.js";
import * as cs from "./Root.css.js";

type Props =
  | {
      type: "button";
      onPress: () => void;
      to?: never;
      isDisabled?: boolean | undefined;
      isHighlighted?: boolean | undefined;
      children: ReactNode;
    }
  | {
      type: "link";
      to: Route;
      onPress?: never;
      isDisabled?: boolean | undefined;
      isHighlighted?: boolean | undefined;
      children: ReactNode;
    };
export default function PrimarySidebarPanelAction({
  type,
  onPress,
  to,
  isDisabled = false,
  isHighlighted = false,
  children,
}: Props) {
  const { closePrimarySidebar } = useShell();
  return type === "link" ? (
    <Link
      to={to}
      onPress={closePrimarySidebar}
      isDisabled={isDisabled}
      className={classnames(
        cs.PrimarySidebarPanelAction.root[type],
        isHighlighted && cs.PrimarySidebarPanelAction.root.highlighted,
      )}
    >
      {children}
    </Link>
  ) : (
    <Button
      variant="invisible"
      onPress={() => {
        onPress();
        closePrimarySidebar();
      }}
      isDisabled={isDisabled}
      className={classnames(
        cs.PrimarySidebarPanelAction.root[type],
        isHighlighted && cs.PrimarySidebarPanelAction.root.highlighted,
      )}
    >
      {children}
    </Button>
  );
}
