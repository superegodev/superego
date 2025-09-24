import type { ReactNode } from "react";
import * as cs from "./ToolResult.css.js";

interface Props {
  children: ReactNode;
}
export default function Title({ children }: Props) {
  return <h5 className={cs.Title.root}>{children}</h5>;
}
