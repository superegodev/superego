import type { ReactNode } from "react";
import { type Control, useFormState } from "react-hook-form";
import classnames from "../../../utils/classnames.js";
import Button from "../../design-system/Button/Button.js";
import ThreeDotSpinner from "../../design-system/ThreeDotSpinner/ThreeDotSpinner.js";
import * as cs from "./RHFSubmitButton.css.js";

interface Props {
  control: Control<any, any, any>;
  formId?: string | undefined;
  isDisabled?: boolean | undefined;
  disableOnNotDirty?: boolean | undefined;
  variant?: "default" | "primary" | "invisible" | "danger" | undefined;
  className?: string | undefined;
  children: ReactNode;
}
export default function RHFSubmitButton({
  control,
  formId,
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
      form={formId}
      className={classnames(cs.RHFSubmitButton.root, className)}
    >
      <ThreeDotSpinner
        className={
          cs.RHFSubmitButton.spinner[isSubmitting ? "visible" : "hidden"]
        }
      />
      {children}
    </Button>
  );
}
