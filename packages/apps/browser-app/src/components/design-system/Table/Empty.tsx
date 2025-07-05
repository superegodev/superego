import type { ReactNode } from "react";
import * as cs from "./Table.css.js";

interface Props {
  children: ReactNode;
}
export default function Empty({ children }: Props) {
  return <span className={cs.Empty.root}>{children}</span>;
}
