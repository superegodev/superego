import type { ReactNode } from "react";
import { Row as RowRAC } from "react-aria-components";
import * as cs from "./Table.css.js";

interface Props {
  children: ReactNode;
}
export default function Row({ children }: Props) {
  return <RowRAC className={cs.Row.root}>{children}</RowRAC>;
}
