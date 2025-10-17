import type { TypescriptLib } from "@superego/backend";
import type { ReactNode } from "react";
import { FieldErrorContext } from "react-aria-components";
import { type Control, useController } from "react-hook-form";
import forms from "../../../business-logic/forms/forms.js";
import { vars } from "../../../themes.css.js";
import classnames from "../../../utils/classnames.js";
import CodeInput from "../../design-system/CodeInput/CodeInput.js";
import type IncludedGlobalUtils from "../../design-system/CodeInput/typescript/IncludedGlobalUtils.js";
import {
  Description,
  FieldError,
  Label,
} from "../../design-system/forms/forms.js";
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
  includedGlobalUtils?: IncludedGlobalUtils | undefined;
  assistantImplementation?:
    | { instructions: string; template: string }
    | undefined;
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
  includedGlobalUtils,
  assistantImplementation,
  className,
}: Props) {
  const { field, fieldState } = useController({ control, name });
  const isInvalid =
    fieldState.invalid &&
    !(
      field.value !== null &&
      typeof field.value === "object" &&
      field.value.compiled === forms.constants.COMPILATION_IN_PROGRESS
    );
  return (
    <div
      data-disabled={isDisabled}
      className={classnames(cs.RHFTypescriptModuleField.root, className)}
    >
      {label ? <Label>{label}</Label> : null}
      <CodeInput
        language="typescript"
        value={field.value ?? { source: "", compiled: "" }}
        onChange={field.onChange}
        onBlur={field.onBlur}
        autoFocus={autoFocus}
        isInvalid={isInvalid}
        isDisabled={isDisabled}
        typescriptLibs={typescriptLibs}
        includedGlobalUtils={includedGlobalUtils}
        assistantImplementation={assistantImplementation}
        maxHeight={vars.spacing._160}
        ref={field.ref}
      />
      <FieldErrorContext
        value={{
          isInvalid: isInvalid,
          validationErrors: fieldState.error?.message
            ? [fieldState.error.message]
            : [],
          validationDetails: {} as any,
        }}
      >
        <FieldError className={cs.RHFTypescriptModuleField.error}>
          {fieldState.error?.message}
        </FieldError>
      </FieldErrorContext>
      {description ? <Description>{description}</Description> : null}
    </div>
  );
}
