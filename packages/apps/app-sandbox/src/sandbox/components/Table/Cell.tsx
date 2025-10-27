import type { ReactNode } from "react";
import { type CellProps, Cell as CellRAC } from "react-aria-components";
import * as cs from "./Table.css.js";

interface Props extends CellProps {
  align?: "left" | "center" | "right" | undefined;
  children: ReactNode;
}
export default function Cell({ align = "left", children }: Props) {
  return <CellRAC className={cs.Cell.root[align]}>{children}</CellRAC>;
}
