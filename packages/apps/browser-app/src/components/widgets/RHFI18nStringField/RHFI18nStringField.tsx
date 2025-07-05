import type { I18nString } from "@superego/global-types";
import type { ReactNode } from "react";
import {
  type FieldPath,
  type FieldValues,
  type UseControllerProps,
  useController,
} from "react-hook-form";
import { useIntl } from "react-intl";
import getLanguageCode from "../../../utils/getLanguageCode.js";
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
  showErrorOnError?: boolean | undefined;
  textArea?: boolean | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
}
export default function RHFI18nStringField<
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
  showErrorOnError = true,
  textArea = false,
  placeholder,
  className,
  ...props
}: Props<TFieldValues, TName, TTransformedValues>) {
  const intl = useIntl();
  const languageCode = getLanguageCode(intl);
  const { field, fieldState } = useController(props);
  return (
    <TextField
      id={field.name}
      name={field.name}
      value={
        isI18nString(field.value)
          ? (field.value[languageCode] ?? field.value.en)
          : ""
      }
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      onChange={(newValue) =>
        field.onChange({ [languageCode]: newValue, en: newValue })
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
  );
}

function isI18nString(value: unknown): value is I18nString {
  // In this context, if the value is an object and is not null we can
  // reasonably assume it's an I18nString.
  return typeof value === "object" && value !== null;
}
