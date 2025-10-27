import type { ReactNode } from "react";

export default interface SelectOption {
  value: string;
  label: ReactNode;
  description?: ReactNode | undefined;
}
