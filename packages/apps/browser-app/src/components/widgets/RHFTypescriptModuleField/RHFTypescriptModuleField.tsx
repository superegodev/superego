import type { ReactNode } from "react";
import { FieldErrorContext } from "react-aria-components";
import { type Control, useController } from "react-hook-form";
import { vars } from "../../../themes.css.js";
import classnames from "../../../utils/classnames.js";
import {
  Description,
  FieldError,
  Label,
} from "../../design-system/forms/forms.js";
import type TypescriptLib from "../../design-system/TypescriptModuleInput/TypescriptLib.js";
import TypescriptModuleInput from "../../design-system/TypescriptModuleInput/TypescriptModuleInput.js";
import * as cs from "./RHFTypescriptModuleField.css.js";

interface Props {
  control: Control<any>;
  name: string;
  label?: ReactNode | undefined;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
  placeholder?: string | undefined;
  typescriptLibs?: TypescriptLib[] | undefined;
  className?: string | undefined;
}
export default function RHFTypescriptModuleField({
  control,
  name,
  label,
  description,
  isDisabled,
  autoFocus,
  typescriptLibs,
  className,
}: Props) {
  const { field, fieldState } = useController({ control, name });
  return (
    <div
      data-disabled={isDisabled}
      className={classnames(cs.RHFTypescriptModuleField.root, className)}
    >
      {label ? <Label>{label}</Label> : null}
      <TypescriptModuleInput
        value={field.value ?? { source: "", compiled: "" }}
        onChange={field.onChange}
        onBlur={field.onBlur}
        autoFocus={autoFocus}
        isInvalid={fieldState.invalid}
        isDisabled={isDisabled}
        typescriptLibs={typescriptLibs}
        maxHeight={vars.spacing._80}
        ref={field.ref}
      />
      <FieldErrorContext
        value={{
          isInvalid: fieldState.invalid,
          validationErrors: fieldState.error?.message
            ? [fieldState.error.message]
            : [],
          validationDetails: {} as any,
        }}
      >
        <FieldError>{fieldState.error?.message}</FieldError>
      </FieldErrorContext>
      {description ? <Description>{description}</Description> : null}
    </div>
  );
}
