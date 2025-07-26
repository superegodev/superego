import type { RefAttributes } from "react";
import { type ColumnProps, Column as ColumnRAC } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Table.css.js";

interface Props extends ColumnProps {
  align?: "left" | "center" | "right" | undefined;
  className?: string | undefined;
}
export default function Column({
  align = "left",
  className,
  ...props
}: Props & RefAttributes<HTMLDivElement | HTMLTableCellElement>) {
  return (
    <ColumnRAC
      {...props}
      className={classnames(cs.Column.root[align], className)}
    />
  );
}
