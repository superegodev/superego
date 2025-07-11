import type { ReactNode } from "react";
import {
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import classnames from "../../../utils/classnames.js";
import {
  Description,
  FieldError,
  Label,
  type Option,
  Select,
  SelectButton,
  SelectOptions,
} from "../../design-system/forms/forms.js";
import * as cs from "./RHFSelectField.css.js";

interface Props<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues,
> extends UseControllerProps<TFieldValues, TName, TTransformedValues> {
  options: Option[];
  label: string;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
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
  autoFocus,
  placeholder,
  className,
}: Props<TFieldValues, TName, TTransformedValues>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <Select
      id={field.name}
      name={field.name}
      selectedKey={field.value ?? null}
      onSelectionChange={field.onChange}
      validationBehavior="aria"
      isDisabled={isDisabled}
      autoFocus={autoFocus}
      isInvalid={fieldState.invalid}
      className={classnames(cs.RHFSelectField.root, className)}
    >
      <Label>{label}</Label>
      <SelectButton placeholder={placeholder} />
      <FieldError>{fieldState.error?.message}</FieldError>
      <SelectOptions options={options} />
      {description ? <Description>{description}</Description> : null}
    </Select>
  );
}
