import { DataType } from "@superego/schema";
import { isEqual } from "es-toolkit";
import { useCallback, useMemo } from "react";
import { FieldErrorContext } from "react-aria-components";
import { useController } from "react-hook-form";
import forms from "../../../../../business-logic/forms/forms.js";
import classnames from "../../../../../utils/classnames.js";
import type ExcalidrawDrawingValue from "../../../../design-system/ExcalidrawInput/ExcalidrawDrawingValue.js";
import ExcalidrawInput from "../../../../design-system/ExcalidrawInput/ExcalidrawInput.js";
import { FieldError } from "../../../../design-system/forms/forms.js";
import AnyFieldLabel from "../../AnyFieldLabel.js";
import NullifyFieldAction from "../../NullifyFieldAction.js";
import * as cs from "../../RHFContentField.css.js";
import { useUiOptions } from "../../uiOptions.js";
import useFieldUiOptions from "../../useFieldUiOptions.js";
import type Props from "../Props.js";

// Immutable default value only used for comparisons. It's not used also when
// setting the actual value to avoid mutations by the input component.
const defaultValue = forms.defaults.excalidrawDrawingJsonObject();

export default function ExcalidrawDrawing({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { isReadOnly, documentId } = useUiOptions();
  const { grow } = useFieldUiOptions(name);
  const { field, fieldState } = useController({ control, name });
  const localStorageKey = documentId
    ? `edap-${documentId.slice("Document_".length)}-${field.name}`
    : null;
  const valueWithoutAppState = useMemo(() => {
    const {
      __dataType: _dt,
      appState: _as,
      ...rest
    } = field.value ?? forms.defaults.excalidrawDrawingJsonObject();
    return rest;
  }, [field.value]);
  const onChange = useCallback(
    (newValue: ExcalidrawDrawingValue) => {
      const { appState, ...rest } = newValue;
      if (localStorageKey && appState) {
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(appState));
        } catch {}
      }
      if (field.value === null && isEqual(rest, defaultValue)) {
        field.onChange(null);
      } else {
        field.onChange({ ...rest, __dataType: DataType.JsonObject });
      }
    },
    [field.onChange, field.value, localStorageKey],
  );
  const excalidrawValue = useMemo(() => {
    if (!isReadOnly && localStorageKey) {
      try {
        const stored = localStorage.getItem(localStorageKey);
        if (stored) {
          return { ...valueWithoutAppState, appState: JSON.parse(stored) };
        }
      } catch {}
    }
    return valueWithoutAppState;
  }, [isReadOnly, localStorageKey, valueWithoutAppState]);
  return (
    <div
      className={classnames(
        cs.JsonObjectField.ExcalidrawDrawing.root,
        isListItem && cs.ListItemField.root,
        grow && cs.Field.grow,
      )}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      data-testid="widgets.RHFContentField.JsonObjectField.ExcalidrawDrawing.root"
    >
      {!isListItem ? (
        <AnyFieldLabel
          name={field.name}
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          label={label}
          actions={
            <NullifyFieldAction
              isNullable={isNullable}
              field={field}
              fieldLabel={label}
            />
          }
        />
      ) : null}
      <ExcalidrawInput
        value={excalidrawValue}
        onChange={onChange}
        onBlur={field.onBlur}
        isInvalid={fieldState.invalid}
        isReadOnly={isReadOnly}
        ref={field.ref}
        className={grow ? cs.Field.growContent : undefined}
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
