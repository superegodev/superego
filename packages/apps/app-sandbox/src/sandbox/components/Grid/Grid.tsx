import type { ReactNode } from "react";
import Col from "./Col.js";
import * as cs from "./Grid.css.js";

interface Props {
  children: ReactNode;
}
export default function Grid({ children }: Props) {
  return <div className={cs.Grid.root}>{children}</div>;
}

Grid.Col = Col;
