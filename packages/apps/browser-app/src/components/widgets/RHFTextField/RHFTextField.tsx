import type { ReactNode } from "react";
import {
  Controller,
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import {
  Description,
  FieldError,
  Input,
  Label,
  TextArea,
  TextField,
} from "../../design-system/forms/forms.js";

interface Props<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues,
> extends UseControllerProps<TFieldValues, TName, TTransformedValues> {
  label?: ReactNode | undefined;
  /** Required for a11y when there is no label. */
  ariaLabel?: string | undefined;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  autoFocus?: boolean | undefined;
  emptyInputValue?: "" | null | undefined;
  showErrorOnError?: boolean | undefined;
  textArea?: boolean | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
}
export default function RHFTextField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  label,
  ariaLabel,
  description,
  isDisabled,
  isReadOnly,
  autoFocus,
  emptyInputValue = "",
  showErrorOnError = true,
  textArea = false,
  placeholder,
  className,
  ...props
}: Props<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      {...props}
      render={({ field, fieldState }) => (
        <TextField
          id={field.name}
          name={field.name}
          value={field.value ?? ""}
          isDisabled={isDisabled}
          isReadOnly={isReadOnly}
          onChange={(value) =>
            field.onChange(value === "" ? emptyInputValue : value)
          }
          onBlur={field.onBlur}
          validationBehavior="aria"
          isInvalid={fieldState.invalid}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          className={className}
        >
          {label ? <Label>{label}</Label> : null}
          {textArea ? (
            <TextArea ref={field.ref} placeholder={placeholder ?? ariaLabel} />
          ) : (
            <Input ref={field.ref} placeholder={placeholder ?? ariaLabel} />
          )}
          {showErrorOnError ? (
            <FieldError>{fieldState.error?.message}</FieldError>
          ) : null}
          {description ? <Description>{description}</Description> : null}
        </TextField>
      )}
    />
  );
}
