import type { RefAttributes } from "react";
import { type RowProps, Row as RowRAC } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Table.css.js";

interface Props<Element extends object> extends RowProps<Element> {
  className?: string | undefined;
}
export default function Row<Element extends object>({
  className,
  ...props
}: Props<Element> & RefAttributes<HTMLTableRowElement>) {
  return <RowRAC {...props} className={classnames(cs.Row.root, className)} />;
}
