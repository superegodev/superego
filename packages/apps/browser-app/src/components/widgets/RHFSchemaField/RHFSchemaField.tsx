import { type ReactNode, useState } from "react";
import {
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import { FormattedMessage } from "react-intl";
import {
  Description,
  FieldError,
  Label,
  TextArea,
  TextField,
} from "../../design-system/forms/forms.js";
import * as cs from "./RHFSchemaField.css.js";

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
  autoFocus?: boolean | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
}
export default function RHFSchemaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  label,
  ariaLabel,
  description,
  isDisabled,
  autoFocus,
  placeholder,
  className,
  ...props
}: Props<TFieldValues, TName, TTransformedValues>) {
  const { field, fieldState } = useController(props);
  const [jsonValue, setJsonValue] = useState(
    () => JSON.stringify(field.value, null, 2) ?? "",
  );
  return (
    <TextField
      id={field.name}
      name={field.name}
      value={jsonValue}
      isDisabled={isDisabled}
      onChange={(newValue) => {
        setJsonValue(newValue);
        try {
          field.onChange(JSON.parse(newValue));
        } catch {
          field.onChange(newValue);
        }
      }}
      onBlur={field.onBlur}
      validationBehavior="aria"
      isInvalid={fieldState.invalid}
      autoFocus={autoFocus}
      aria-label={ariaLabel}
      className={className}
    >
      {label ? <Label>{label}</Label> : null}
      <TextArea
        ref={field.ref}
        placeholder={placeholder}
        className={cs.RHFSchemaField.textArea}
      />
      <FieldError>
        {typeof field.value === "string" ? (
          <FormattedMessage defaultMessage="Not a valid JSON string" />
        ) : (
          <FormattedMessage defaultMessage="Invalid schema" />
        )}
      </FieldError>
      {description ? <Description>{description}</Description> : null}
    </TextField>
  );
}
