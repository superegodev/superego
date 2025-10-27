import type { ReactNode } from "react";
import { type ColumnProps, Column as ColumnRAC } from "react-aria-components";
import * as cs from "./Table.css.js";

interface Props extends ColumnProps {
  isRowHeader?: boolean | undefined;
  align?: "left" | "center" | "right" | undefined;
  children: ReactNode;
}
export default function Column({
  isRowHeader,
  align = "left",
  children,
}: Props) {
  return (
    <ColumnRAC isRowHeader={isRowHeader} className={cs.Column.root[align]}>
      {children}
    </ColumnRAC>
  );
}
