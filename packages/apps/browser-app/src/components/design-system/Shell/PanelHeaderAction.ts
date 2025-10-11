import type { ReactNode } from "react";
import type Route from "../../../business-logic/navigation/Route.js";

type PanelHeaderAction = {
  label: string;
  icon: ReactNode;
  isDisabled?: boolean | undefined;
  className?: string | undefined;
} & ({ to: Route } | { onPress: () => void } | { submit: string });
export default PanelHeaderAction;
