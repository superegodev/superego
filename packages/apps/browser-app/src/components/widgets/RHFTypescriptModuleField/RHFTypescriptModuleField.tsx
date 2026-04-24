import type { TypescriptFile } from "@superego/backend";
import type { ReactNode } from "react";
import { FieldErrorContext } from "react-aria-components";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";
import forms from "../../../business-logic/forms/forms.js";
import { vars } from "../../../themes.css.js";
import classnames from "../../../utils/classnames.js";
import {
  Description,
  FieldError,
  Label,
} from "../../design-system/forms/forms.js";
import CodeInput from "../CodeInput/CodeInput.js";
import type IncludedGlobalUtils from "../CodeInput/typescript/IncludedGlobalUtils.js";
import type UndoRedo from "../CodeInput/UndoRedo.js";
import * as cs from "./RHFTypescriptModuleField.css.js";

interface Props<T extends FieldValues = FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: ReactNode | undefined;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  autoFocus?: boolean | undefined;
  placeholder?: string | undefined;
  language: "typescript" | "typescript-jsx";
  undoRedo?: UndoRedo | undefined;
  typescriptLibs?: TypescriptFile[] | undefined;
  includedGlobalUtils?: IncludedGlobalUtils | undefined;
  assistantImplementation?:
    | {
        description: string;
        rules?: string | undefined;
        additionalInstructions?: string | undefined;
        template: string;
        userRequest: string;
      }
    | undefined;
  maxHeight?: string | undefined;
  className?: string | undefined;
  codeInputClassName?: string | undefined;
}
export default function RHFTypescriptModuleField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  isDisabled,
  isReadOnly,
  autoFocus,
  language,
  undoRedo,
  typescriptLibs,
  includedGlobalUtils,
  assistantImplementation,
  maxHeight,
  className,
  codeInputClassName,
}: Props<T>) {
  const { field, fieldState } = useController({ control, name });
  const value = field.value as Record<string, unknown> | null;
  const isInvalid =
    fieldState.invalid &&
    !(
      value !== null &&
      typeof value === "object" &&
      value["compiled"] === forms.constants.COMPILATION_IN_PROGRESS
    );
  return (
    <div
      data-disabled={isDisabled}
      className={classnames(cs.RHFTypescriptModuleField.root, className)}
    >
      {label ? <Label>{label}</Label> : null}
      <CodeInput
        language={language}
        value={field.value ?? { source: "", compiled: "" }}
        onChange={field.onChange}
        onBlur={field.onBlur}
        undoRedo={undoRedo}
        autoFocus={autoFocus}
        isInvalid={isInvalid}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        typescriptLibs={typescriptLibs}
        includedGlobalUtils={includedGlobalUtils}
        assistantImplementation={assistantImplementation}
        maxHeight={maxHeight ?? vars.spacing._160}
        className={codeInputClassName}
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
