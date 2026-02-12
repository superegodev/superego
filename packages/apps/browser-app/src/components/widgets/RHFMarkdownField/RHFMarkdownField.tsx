import { type ReactNode, useCallback } from "react";
import {
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import {
  Description,
  FieldError,
  Label,
  TextField,
} from "../../design-system/forms/forms.js";
import MarkdownInput from "../../design-system/MarkdownInput/MarkdownInput.js";

interface Props<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues,
> extends UseControllerProps<TFieldValues, TName, TTransformedValues> {
  label?: ReactNode | undefined;
  description?: ReactNode | undefined;
  isReadOnly?: boolean | undefined;
  showToolbar?: boolean | undefined;
  emptyInputValue?: "" | null | undefined;
  placeholder?: string | undefined;
}
export default function RHFMarkdownField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  label,
  description,
  isReadOnly,
  showToolbar,
  emptyInputValue = "",
  placeholder,
  ...props
}: Props<TFieldValues, TName, TTransformedValues>) {
  const { field, fieldState } = useController(props);
  const fieldOnChange = field.onChange;
  const onChange = useCallback(
    (newValue: string) =>
      fieldOnChange(newValue === "" ? emptyInputValue : newValue),
    [fieldOnChange, emptyInputValue],
  );
  return (
    <TextField
      id={field.name}
      name={field.name}
      isReadOnly={isReadOnly}
      validationBehavior="aria"
      isInvalid={fieldState.invalid}
    >
      {label ? <Label>{label}</Label> : null}
      <MarkdownInput
        value={field.value ?? ""}
        onChange={onChange}
        onBlur={field.onBlur}
        id={field.name}
        isInvalid={fieldState.invalid}
        isReadOnly={isReadOnly}
        showToolbar={showToolbar}
        placeholder={placeholder}
        ref={field.ref}
      />
      <FieldError>{fieldState.error?.message}</FieldError>
      {description ? <Description>{description}</Description> : null}
    </TextField>
  );
}
