import type { ReactNode } from "react";
import { Toolbar } from "react-aria-components";
import type Route from "../../../business-logic/navigation/Route.js";
import classnames from "../../../utils/classnames.js";
import IconButton from "../IconButton/IconButton.js";
import IconLink from "../IconLink/IconLink.js";
import * as cs from "./Shell.css.js";

type Action = {
  label: string;
  icon: ReactNode;
  isDisabled?: boolean | undefined;
} & ({ to: Route } | { onPress: () => void } | { submit: string });

interface Props {
  title?: ReactNode | undefined;
  actions?: Action[] | undefined;
  actionsAriaLabel?: string | undefined;
  className?: string | undefined;
}
export default function PanelHeader({
  title,
  actions,
  actionsAriaLabel,
  className,
}: Props) {
  return (
    <header className={classnames(cs.PanelHeader.root, className)}>
      {title ? <div className={cs.PanelHeader.title}>{title}</div> : null}
      {actions ? (
        <Toolbar aria-label={actionsAriaLabel}>
          {actions.map((action) =>
            "to" in action ? (
              <IconLink
                key={action.label}
                label={action.label}
                isDisabled={action.isDisabled}
                to={action.to}
                variant="invisible"
                className={cs.PanelHeader.action}
              >
                {action.icon}
              </IconLink>
            ) : (
              <IconButton
                key={action.label}
                label={action.label}
                isDisabled={action.isDisabled}
                type={"submit" in action ? "submit" : "button"}
                form={"submit" in action ? action.submit : undefined}
                onPress={"onPress" in action ? action.onPress : undefined}
                variant="invisible"
                className={cs.PanelHeader.action}
              >
                {action.icon}
              </IconButton>
            ),
          )}
        </Toolbar>
      ) : null}
    </header>
  );
}
