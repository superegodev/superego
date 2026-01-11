import type { ReactNode } from "react";
import {
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import {
  Description,
  FieldError,
  Input,
  Label,
  type Option,
  Select,
  SelectButton,
  SelectOptions,
  TextField,
} from "../../design-system/forms/forms.js";

interface Props<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues,
> extends UseControllerProps<TFieldValues, TName, TTransformedValues> {
  options: Option[];
  label: string;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
  isReadOnly?: boolean | undefined;
  autoFocus?: boolean | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
}
export default function RHFSelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  options,
  label,
  description,
  isDisabled,
  isReadOnly,
  autoFocus,
  placeholder,
  className,
}: Props<TFieldValues, TName, TTransformedValues>) {
  const { field, fieldState } = useController({ control, name });

  if (isReadOnly) {
    const selectedOption = options.find((opt) => opt.id === field.value);
    return (
      <TextField
        id={field.name}
        name={field.name}
        value={selectedOption?.label ?? field.value ?? ""}
        isReadOnly={true}
        className={className}
      >
        <Label>{label}</Label>
        <Input ref={field.ref} placeholder={placeholder} />
        <FieldError>{fieldState.error?.message}</FieldError>
        {description ? <Description>{description}</Description> : null}
      </TextField>
    );
  }

  return (
    <Select
      id={field.name}
      name={field.name}
      value={field.value ?? null}
      onChange={field.onChange}
      validationBehavior="aria"
      isDisabled={isDisabled}
      autoFocus={autoFocus}
      isInvalid={fieldState.invalid}
      className={className}
    >
      <Label>{label}</Label>
      <SelectButton placeholder={placeholder} />
      <FieldError>{fieldState.error?.message}</FieldError>
      <SelectOptions options={options} />
      {description ? <Description>{description}</Description> : null}
    </Select>
  );
}
