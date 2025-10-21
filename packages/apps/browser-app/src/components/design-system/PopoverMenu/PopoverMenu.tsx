import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { MenuTrigger } from "react-aria-components";
import Popover from "../Popover/Popover.js";
import Menu from "./Menu.js";
import MenuItem from "./MenuItem.js";
import Trigger from "./Trigger.js";

interface Props {
  children: ReactNode;
  className?: string | undefined;
}
export default function PopoverMenu({ className, children }: Props) {
  let menu: ReactElement | null = null;
  let trigger: ReactElement | null = null;
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      if (child.type === Menu) {
        menu = child;
      }
      if (child.type === Trigger) {
        trigger = child;
      }
    }
  });
  return (
    <MenuTrigger>
      {trigger}
      <Popover className={className}>{menu}</Popover>
    </MenuTrigger>
  );
}

PopoverMenu.Menu = Menu;
PopoverMenu.MenuItem = MenuItem;
PopoverMenu.Trigger = Trigger;
