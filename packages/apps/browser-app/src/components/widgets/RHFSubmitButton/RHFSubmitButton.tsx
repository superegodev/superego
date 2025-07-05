import type { ReactNode } from "react";
import { type Control, useFormState } from "react-hook-form";
import Button from "../../design-system/Button/Button.js";

interface Props {
  control: Control<any, any, any>;
  isDisabled?: boolean | undefined;
  disableOnNotDirty?: boolean | undefined;
  variant?: "default" | "primary" | "invisible" | "danger" | undefined;
  className?: string | undefined;
  children: ReactNode;
}
export default function RHFSubmitButton({
  control,
  isDisabled,
  disableOnNotDirty = true,
  variant,
  className,
  children,
}: Props) {
  const { isSubmitting, isDirty } = useFormState({ control });
  return (
    <Button
      type="submit"
      isDisabled={isDisabled || (disableOnNotDirty && !isDirty) || isSubmitting}
      variant={variant}
      className={className}
    >
      {children}
    </Button>
  );
}
