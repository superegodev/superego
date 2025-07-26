import type { RefAttributes } from "react";
import { type CellProps, Cell as CellRAC } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Table.css.js";

interface Props extends CellProps {
  align?: "left" | "center" | "right" | undefined;
  className?: string | undefined;
}
export default function Cell({
  align = "left",
  className,
  ...props
}: Props & RefAttributes<HTMLDivElement | HTMLTableCellElement>) {
  return (
    <CellRAC
      {...props}
      className={classnames(cs.Cell.root[align], className)}
    />
  );
}
