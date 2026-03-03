import type { ReactNode } from "react";

export default interface Props {
  value: Record<string, any> | null;
  onChange: (newValue: Record<string, any> | null) => void;
  label?: ReactNode | undefined;
  ariaLabel?: string | undefined;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
}
