import { DataType } from "@superego/schema";
import { useEffect, useState } from "react";
import { useController } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import classnames from "../../../../../utils/classnames.js";
import {
  FieldError,
  TextArea,
  TextField,
} from "../../../../design-system/forms/forms.js";
import AnyFieldLabel from "../../AnyFieldLabel.js";
import * as cs from "../../RHFContentField.css.js";
import type Props from "../Props.js";

export default function Default({
  typeDefinition,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { field, fieldState } = useController({ control, name });
  const [jsonValue, setJsonValue] = useState(() =>
    getJsonValueFromValue(field.value),
  );
  useEffect(() => {
    if (field.value === null) {
      setJsonValue("");
    }
  }, [field.value]);
  return (
    <TextField
      id={field.name}
      name={field.name}
      value={jsonValue}
      onChange={(newValue) => {
        setJsonValue(newValue);
        if (newValue === "") {
          field.onChange(null);
          return;
        }
        try {
          field.onChange({
            ...JSON.parse(newValue),
            __dataType: DataType.JsonObject,
          });
        } catch {
          field.onChange(newValue);
        }
      }}
      onBlur={() => {
        // Resets jsonValue, so it re-formats.
        setJsonValue(getJsonValueFromValue(field.value));
        field.onBlur();
      }}
      validationBehavior="aria"
      isInvalid={fieldState.invalid}
      aria-label={isListItem ? label : undefined}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      className={classnames(isListItem && cs.ListItemField.root)}
    >
      {!isListItem ? (
        <AnyFieldLabel typeDefinition={typeDefinition} label={label} />
      ) : null}
      <TextArea
        ref={field.ref}
        placeholder={field.value === null ? "null" : undefined}
        className={cs.JsonObjectField.Default.textArea}
      />
      <FieldError>
        {typeof field.value === "string" ? (
          <FormattedMessage defaultMessage="Not a valid JSON string" />
        ) : (
          fieldState.error?.message
        )}
      </FieldError>
    </TextField>
  );
}

function getJsonValueFromValue(value: unknown): string {
  if (typeof value !== "object" || value === null) {
    return "";
  }
  const { __dataType, ...rest } = value as any;
  return JSON.stringify(rest, null, 2);
}
