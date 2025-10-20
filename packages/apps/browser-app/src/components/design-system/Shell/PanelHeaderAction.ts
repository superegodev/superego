import type { ReactNode } from "react";
import type Route from "../../../business-logic/navigation/Route.js";

type PanelHeaderAction = {
  label: string;
  icon: ReactNode;
  isDisabled?: boolean | undefined;
  className?: string | undefined;
} & (
  | { to: Route }
  | { href: string }
  | {
      menuItems: {
        key: string;
        label: ReactNode;
        onAction?: () => void;
        to?: Route;
        isActive?: boolean;
        isDisabled?: boolean;
      }[];
    }
  | { onPress: () => void }
  | { submit: string }
);
export default PanelHeaderAction;
