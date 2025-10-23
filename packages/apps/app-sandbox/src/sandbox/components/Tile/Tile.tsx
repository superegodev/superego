import type { ReactNode } from "react";
import * as cs from "./Tile.css.js";

interface Props {
  children: ReactNode;
}
export default function Tile({ children }: Props) {
  return <div className={cs.Tile.root}>{children}</div>;
}
