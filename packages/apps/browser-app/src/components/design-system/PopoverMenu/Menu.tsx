import type { RefAttributes } from "react";
import { type MenuProps, Menu as MenuRAC } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./PopoverMenu.css.js";

interface Props<T> extends MenuProps<T> {
  className?: string | undefined;
}
export default function Menu<T extends object>({
  className,
  ...props
}: Props<T> & RefAttributes<any>) {
  return (
    <MenuRAC<T> {...props} className={classnames(cs.Menu.root, className)} />
  );
}
