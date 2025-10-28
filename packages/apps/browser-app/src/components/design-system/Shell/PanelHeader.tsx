import type { ReactNode } from "react";
import { Separator, Toolbar } from "react-aria-components";
import { PiList } from "react-icons/pi";
import { useIntl } from "react-intl";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import useShell from "../../../business-logic/navigation/useShell.js";
import classnames from "../../../utils/classnames.js";
import IconButton from "../IconButton/IconButton.js";
import IconLink from "../IconLink/IconLink.js";
import PopoverMenu from "../PopoverMenu/PopoverMenu.js";
import type PanelHeaderAction from "./PanelHeaderAction.js";
import PanelHeaderActionSeparator from "./PanelHeaderActionSeparator.js";
import * as cs from "./Shell.css.js";

interface Props {
  title?: ReactNode | undefined;
  actions?:
    | (PanelHeaderAction | typeof PanelHeaderActionSeparator | null)[]
    | undefined;
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
            .map(renderPanelHeaderAction)}
        </Toolbar>
      ) : null}
    </header>
  );
}

function renderPanelHeaderAction(
  action: PanelHeaderAction | typeof PanelHeaderActionSeparator,
  index: number,
) {
  if (action === PanelHeaderActionSeparator) {
    return (
      <Separator
        key={PanelHeaderActionSeparator + index}
        orientation="vertical"
        className={cs.PanelHeader.actionsSeparator}
      />
    );
  }

  if ("to" in action || "href" in action) {
    return (
      <IconLink
        key={action.label}
        label={action.label}
        isDisabled={action.isDisabled}
        {...("to" in action
          ? { to: action.to }
          : { href: action.href, target: "_blank" })}
        variant="invisible"
        className={classnames(
          cs.PanelHeader.action,

          action.className,
        )}
      >
        {action.icon}
      </IconLink>
    );
  }

  if ("menuItems" in action) {
    return (
      <PopoverMenu key={action.label} placement="bottom right">
        <PopoverMenu.Trigger>
          <IconButton
            label={action.label}
            variant="invisible"
            className={classnames(cs.PanelHeader.action, action.className)}
          >
            {action.icon}
          </IconButton>
        </PopoverMenu.Trigger>
        <PopoverMenu.Menu>
          {action.menuItems.map((menuItem) => (
            <PopoverMenu.MenuItem
              key={menuItem.key}
              onAction={menuItem.onAction}
              href={menuItem.to ? toHref(menuItem.to) : undefined}
              isDisabled={menuItem.isDisabled}
              className={
                menuItem.isActive
                  ? cs.PanelHeader.activeActionMenuItem
                  : undefined
              }
            >
              {menuItem.label}
            </PopoverMenu.MenuItem>
          ))}
        </PopoverMenu.Menu>
      </PopoverMenu>
    );
  }

  if ("onPress" in action || "submit" in action) {
    return (
      <IconButton
        key={action.label}
        label={action.label}
        isDisabled={action.isDisabled}
        type={"submit" in action ? "submit" : "button"}
        form={"submit" in action ? action.submit : undefined}
        onPress={"onPress" in action ? action.onPress : undefined}
        variant="invisible"
        className={classnames(cs.PanelHeader.action, action.className)}
      >
        {action.icon}
      </IconButton>
    );
  }
  return null;
}
