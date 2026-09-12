import { normalizeHttpOrigin, valibotSchemas } from "@superego/shared-utils";
import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
} from "react-hook-form";
import { useIntl } from "react-intl";
import * as v from "valibot";
import {
  FieldError,
  Input,
  TextField,
} from "../../design-system/forms/forms.js";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  itemIndex: number;
  autoFocus: boolean;
}
export default function HttpOriginField<T extends FieldValues>({
  control,
  name,
  itemIndex,
  autoFocus,
}: Props<T>) {
  const intl = useIntl();
  const {
    field: { ref: fieldRef, ...field },
    fieldState,
  } = useController({ control, name });
  const errorMessage = v.is(valibotSchemas.httpOrigin(), field.value)
    ? undefined
    : intl.formatMessage({
        defaultMessage:
          "Enter a valid HTTP(S) origin without a path, query, or fragment.",
      });
  return (
    <TextField
      name={field.name}
      value={field.value ?? ""}
      onChange={field.onChange}
      onBlur={() => {
        try {
          const normalizedOrigin = normalizeHttpOrigin(field.value);
          if (normalizedOrigin !== field.value) {
            field.onChange(normalizedOrigin);
          }
        } catch {
          // Leave invalid input in place for contextual validation.
        }
        field.onBlur();
      }}
      validationBehavior="aria"
      isInvalid={fieldState.invalid || !!errorMessage}
      autoComplete="off"
      autoFocus={autoFocus}
      aria-label={intl.formatMessage(
        { defaultMessage: "HTTP origin number {itemNumber}" },
        { itemNumber: itemIndex + 1 },
      )}
    >
      <Input ref={fieldRef} placeholder="https://api.example.com" />
      <FieldError>{errorMessage ?? fieldState.error?.message}</FieldError>
    </TextField>
  );
}
