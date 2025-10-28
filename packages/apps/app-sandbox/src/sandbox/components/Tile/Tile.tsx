import type { CSSProperties, ReactNode } from "react";
import * as cs from "./Tile.css.js";

interface Props {
  style?: CSSProperties;
  children: ReactNode;
}
export default function Tile({ style, children }: Props) {
  return (
    <div style={style} className={cs.Tile.root}>
      {children}
    </div>
  );
}
