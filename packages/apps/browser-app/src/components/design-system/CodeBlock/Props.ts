import type { Property } from "csstype";
import type { MouseEventHandler } from "react";

export default interface Props {
  language: "typescript" | "javascript" | "json";
  code: string;
  onMouseDown?: MouseEventHandler<HTMLDivElement> | undefined;
  maxHeight?: Property.MaxHeight | undefined;
  showCopyButton?: boolean | undefined;
  mirrorCodeInput?: boolean | undefined;
}
