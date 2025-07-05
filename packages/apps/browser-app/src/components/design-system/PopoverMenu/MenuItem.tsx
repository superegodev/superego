import type { RefAttributes } from "react";
import {
  type MenuItemProps,
  MenuItem as MenuItemRAC,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./PopoverMenu.css.js";

interface Props extends MenuItemProps {
  className?: string | undefined;
}
export default function MenuItem({
  className,
  ...props
}: Props & RefAttributes<any>) {
  return (
    <MenuItemRAC
      {...props}
      className={classnames(cs.MenuItem.root, className)}
    />
  );
}
