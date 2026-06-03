import type { Route } from "@superego/routing";
import type { ReactNode } from "react";

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
  | {
      onPress: () => void;
      isPrimary?: boolean | undefined;
      isDanger?: boolean | undefined;
    }
  | {
      submit: string;
      isPrimary?: boolean | undefined;
      isDanger?: boolean | undefined;
    }
);
export default PanelHeaderAction;
