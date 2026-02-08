import { DataType } from "@superego/schema";
import { useMemo } from "react";
import { useController } from "react-hook-form";
import classnames from "../../../../../utils/classnames.js";
import { FieldError, TextField } from "../../../../design-system/forms/forms.js";
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
  const geoJsonValue = useMemo(
    () => getGeoJsonFromValue(field.value),
    [field.value],
  );
  const onMapChange = (
    newValue: Record<string, unknown> | null | undefined,
  ) => {
    if (!newValue) {
      field.onChange(null);
      return;
    }
    field.onChange({ ...newValue, __dataType: DataType.JsonObject });
  };
  return (
    <TextField
      id={field.name}
      name={field.name}
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
        value={geoJsonValue}
        onChange={onMapChange}
        isInvalid={fieldState.invalid}
        isReadOnly={isReadOnly}
        className={cs.JsonObjectField.GeoJSON.map}
      />
      <FieldError>{fieldState.error?.message}</FieldError>
    </TextField>
  );
}

function getGeoJsonFromValue(
  value: unknown,
): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const { __dataType, ...rest } = value as Record<string, unknown>;
  return rest;
}
