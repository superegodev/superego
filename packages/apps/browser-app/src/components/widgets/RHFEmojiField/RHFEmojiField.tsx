import type { ReactNode } from "react";
import { FieldErrorContext } from "react-aria-components";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";
import classnames from "../../../utils/classnames.js";
import EmojiInput from "../../design-system/EmojiInput/EmojiInput.js";
import FieldError from "../../design-system/forms/FieldError.js";
import { Description } from "../../design-system/forms/forms.js";
import Label from "../../design-system/forms/Label.js";
import * as cs from "./RHFEmojiField.css.js";

interface Props<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues,
> {
  name: TName;
  control?: Control<TFieldValues, any, TTransformedValues>;
  label?: ReactNode | undefined;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  autoFocus?: boolean | undefined;
  showErrorOnError?: boolean | undefined;
  textArea?: boolean | undefined;
  className?: string | undefined;
}
export default function RHFEmojiField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  description,
  isDisabled,
  isReadOnly,
  className,
}: Props<TFieldValues, TName, TTransformedValues>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <div
      data-disabled={isDisabled}
      className={classnames(cs.RHFEmojiField.root, className)}
    >
      {label ? <Label htmlFor={field.name}>{label}</Label> : null}
      <EmojiInput
        value={field.value}
        onChange={field.onChange}
        id={field.name}
        isReadOnly={isReadOnly}
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
