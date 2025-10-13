import type { ReactNode } from "react";
import { Toolbar } from "react-aria-components";
import { PiList } from "react-icons/pi";
import { useIntl } from "react-intl";
import useShell from "../../../business-logic/navigation/useShell.js";
import classnames from "../../../utils/classnames.js";
import IconButton from "../IconButton/IconButton.js";
import IconLink from "../IconLink/IconLink.js";
import type PanelHeaderAction from "./PanelHeaderAction.js";
import * as cs from "./Shell.css.js";

interface Props {
  title?: ReactNode | undefined;
  actions?: (PanelHeaderAction | null)[] | undefined;
  actionsAriaLabel?: string | undefined;
  withPrimarySidebarToggleButton?: boolean | undefined;
  className?: string | undefined;
}
export default function PanelHeader({
  title,
  actions,
  actionsAriaLabel,
  withPrimarySidebarToggleButton = true,
  className,
}: Props) {
  const intl = useIntl();
  const {
    togglePrimarySidebarButtonId,
    isPrimarySidebarOpen,
    togglePrimarySidebar,
  } = useShell();
  return (
    <header className={classnames(cs.PanelHeader.root, className)}>
      <div className={cs.PanelHeader.leftSection}>
        {withPrimarySidebarToggleButton ? (
          <IconButton
            id={togglePrimarySidebarButtonId}
            variant="invisible"
            label={
              isPrimarySidebarOpen
                ? intl.formatMessage({ defaultMessage: "Close sidebar" })
                : intl.formatMessage({ defaultMessage: "Open sidebar" })
            }
            onPress={togglePrimarySidebar}
            className={cs.PanelHeader.primarySidebarToggleButton}
          >
            <PiList />
          </IconButton>
        ) : null}
        {title ? <div className={cs.PanelHeader.title}>{title}</div> : null}
      </div>
      {actions ? (
        <Toolbar
          aria-label={actionsAriaLabel}
          className={cs.PanelHeader.actionsToolbar}
        >
          {actions
            .filter((action) => action !== null)
            .map((action) =>
              "to" in action ? (
                <IconLink
                  key={action.label}
                  label={action.label}
                  isDisabled={action.isDisabled}
                  to={action.to}
                  variant="invisible"
                  className={classnames(
                    cs.PanelHeader.action,
                    action.className,
                  )}
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
                  className={classnames(
                    cs.PanelHeader.action,
                    action.className,
                  )}
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
