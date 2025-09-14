import type { Property } from "csstype";
import type { MouseEventHandler } from "react";

export default interface Props {
  language: "typescript" | "javascript" | "json";
  code: string;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  maxHeight?: Property.MaxHeight;
  mirrorCodeInput?: boolean;
}
