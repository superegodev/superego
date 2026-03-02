import type { JSONContent } from "@tiptap/react";
import type { ReactNode } from "react";

export default interface Props {
  value: JSONContent | null;
  onChange: (newValue: JSONContent | null) => void;
  layout?: "vertical" | "horizontal" | undefined;
  label?: ReactNode | undefined;
  ariaLabel?: string | undefined;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
}
