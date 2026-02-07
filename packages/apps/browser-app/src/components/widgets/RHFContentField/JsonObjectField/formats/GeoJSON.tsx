import { DataType } from "@superego/schema";
import { useEffect, useMemo, useState } from "react";
import { useController } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import classnames from "../../../../../utils/classnames.js";
import {
  FieldError,
  TextArea,
  TextField,
} from "../../../../design-system/forms/forms.js";
import GeoJSONInput from "../../../../design-system/GeoJSONInput/GeoJSONInput.js";
import AnyFieldLabel from "../../AnyFieldLabel.js";
import * as cs from "../../RHFContentField.css.js";
import { useUiOptions } from "../../uiOptions.js";
import type Props from "../Props.js";

export default function GeoJSON({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { isReadOnly } = useUiOptions();
  const { field, fieldState } = useController({ control, name });
  const [jsonValue, setJsonValue] = useState(() =>
    getJsonValueFromValue(field.value),
  );
  useEffect(() => {
    if (field.value === null) {
      setJsonValue("");
    }
  }, [field.value]);
  const parsedGeoJson = useMemo(
    () => parseGeoJsonFromString(jsonValue),
    [jsonValue],
  );
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
        setJsonValue(getJsonValueFromValue(field.value));
        field.onBlur();
      }}
      validationBehavior="aria"
      isInvalid={fieldState.invalid}
      isReadOnly={isReadOnly}
      aria-label={isListItem ? label : undefined}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      className={classnames(
        isListItem && cs.ListItemField.root,
        cs.JsonObjectField.GeoJSON.root,
      )}
    >
      {!isListItem ? (
        <AnyFieldLabel
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          label={label}
        />
      ) : null}
      <GeoJSONInput
        value={parsedGeoJson}
        isInvalid={fieldState.invalid}
        isReadOnly={isReadOnly}
        className={cs.JsonObjectField.GeoJSON.map}
      />
      <TextArea
        ref={field.ref}
        placeholder={field.value === null ? "null" : undefined}
        className={cs.JsonObjectField.GeoJSON.textArea}
      />
      <FieldError>
        {typeof field.value === "string" ? (
          <FormattedMessage defaultMessage="Not a valid GeoJSON string" />
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
  const { __dataType, ...rest } = value as Record<string, unknown>;
  return JSON.stringify(rest, null, 2);
}

function parseGeoJsonFromString(value: string): Record<string, unknown> | null {
  if (value === "") {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    const { __dataType, ...rest } = parsed as Record<string, unknown>;
    return rest;
  } catch {
    return null;
  }
}
