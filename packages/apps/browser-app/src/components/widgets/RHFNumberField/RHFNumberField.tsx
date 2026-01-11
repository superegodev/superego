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
  NumberField,
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
  textArea?: boolean | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
}
export default function RHFNumberField<
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
  textArea = false,
  placeholder,
  className,
  ...props
}: Props<TFieldValues, TName, TTransformedValues>) {
  return (
    <Controller
      {...props}
      render={({ field, fieldState }) => (
        <NumberField
          id={field.name}
          name={field.name}
          value={field.value}
          isDisabled={isDisabled}
          isReadOnly={isReadOnly}
          onChange={field.onChange}
          onBlur={field.onBlur}
          validationBehavior="aria"
          isInvalid={fieldState.invalid}
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          className={className}
        >
          {label ? <Label>{label}</Label> : null}
          <Input ref={field.ref} placeholder={placeholder} />
          <FieldError>{fieldState.error?.message}</FieldError>
          {description ? <Description>{description}</Description> : null}
        </NumberField>
      )}
    />
  );
}
