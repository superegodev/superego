import type { ReactNode } from "react";

export default interface Props {
  value: string | null;
  onChange: (newValue: string | null) => void;
  layout?: "vertical" | "horizontal" | undefined;
  label?: ReactNode | undefined;
  ariaLabel?: string | undefined;
  description?: ReactNode | undefined;
  placeholder?: string | undefined;
  isDisabled?: boolean | undefined;
}
