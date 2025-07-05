import type { RefAttributes } from "react";
import { TableBody, type TableBodyProps } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Table.css.js";

interface Props<Element extends object> extends TableBodyProps<Element> {
  className?: string | undefined;
}
export default function Body<Element extends object>({
  className,
  ...props
}: Props<Element> & RefAttributes<HTMLTableSectionElement>) {
  return (
    <TableBody {...props} className={classnames(cs.Body.root, className)} />
  );
}
