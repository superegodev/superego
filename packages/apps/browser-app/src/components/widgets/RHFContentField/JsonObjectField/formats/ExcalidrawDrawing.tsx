import { DataType } from "@superego/schema";
import { useCallback } from "react";
import { FieldErrorContext } from "react-aria-components";
import { useController } from "react-hook-form";
import forms from "../../../../../business-logic/forms/forms.js";
import classnames from "../../../../../utils/classnames.js";
import ExcalidrawInput from "../../../../design-system/ExcalidrawInput/ExcalidrawInput.js";
import { FieldError } from "../../../../design-system/forms/forms.js";
import AnyFieldLabel from "../../AnyFieldLabel.js";
import * as cs from "../../RHFContentField.css.js";
import { useUiOptions } from "../../uiOptions.js";
import type Props from "../Props.js";

export default function ExcalidrawDrawing({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { isReadOnly } = useUiOptions();
  const { field, fieldState } = useController({ control, name });
  const { __dataType, ...value } =
    field.value ?? forms.defaults.excalidrawDrawingJsonObject();
  const fieldOnChange = field.onChange;
  const onChange = useCallback(
    (newValue: typeof value) =>
      fieldOnChange({ ...newValue, __dataType: DataType.JsonObject }),
    [fieldOnChange],
  );
  return (
    <div
      className={classnames(
        cs.JsonObjectField.ExcalidrawDrawing.root,
        isListItem && cs.ListItemField.root,
      )}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
    >
      {!isListItem ? (
        <AnyFieldLabel
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          label={label}
        />
      ) : null}
      <ExcalidrawInput
        value={value}
        onChange={onChange}
        onBlur={field.onBlur}
        isInvalid={fieldState.invalid}
        isReadOnly={isReadOnly}
        ref={field.ref}
      />
      <FieldErrorContext
        value={{
          isInvalid: fieldState.invalid,
          validationErrors: fieldState.error?.message
            ? [fieldState.error.message]
            : [],
          validationDetails: {} as any,
        }}
      >
        <FieldError>{fieldState.error?.message}</FieldError>
      </FieldErrorContext>
    </div>
  );
}
