import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";
import * as cs from "./Tile.css.js";

interface Props {
  fillHeight?: boolean;
  style?: CSSProperties;
  children: ReactNode;
}
export default function Tile({ fillHeight, style, children }: Props) {
  return (
    <div
      style={style}
      className={clsx(cs.Tile.root, fillHeight && cs.Tile.fillHeight)}
    >
      {children}
    </div>
  );
}
