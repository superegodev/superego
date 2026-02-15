import { DataType } from "@superego/schema";
import type { JSONContent } from "@tiptap/react";
import { useCallback } from "react";
import { FieldErrorContext } from "react-aria-components";
import { useController } from "react-hook-form";
import forms from "../../../../../business-logic/forms/forms.js";
import classnames from "../../../../../utils/classnames.js";
import { FieldError } from "../../../../design-system/forms/forms.js";
import TiptapInput from "../../../../design-system/TiptapInput/TiptapInput.js";
import AnyFieldLabel from "../../AnyFieldLabel.js";
import * as cs from "../../RHFContentField.css.js";
import { useUiOptions } from "../../uiOptions.js";
import useFieldUiOptions from "../../useFieldUiOptions.js";
import type Props from "../Props.js";

export default function TiptapRichText({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { isReadOnly } = useUiOptions();
  const { grow } = useFieldUiOptions(name);
  const { field, fieldState } = useController({ control, name });
  const { __dataType, ...value } =
    field.value ?? forms.defaults.tiptapRichTextJsonObject();
  const onChange = useCallback(
    (newValue: JSONContent) =>
      field.onChange({ ...newValue, __dataType: DataType.JsonObject }),
    [field.onChange],
  );
  return (
    <div
      className={classnames(
        cs.JsonObjectField.TiptapRichText.root,
        isListItem && cs.ListItemField.root,
        grow && cs.Field.grow,
      )}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      data-testid="widgets.RHFContentField.JsonObjectField.TiptapRichText.root"
    >
      {!isListItem ? (
        <AnyFieldLabel
          name={field.name}
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          label={label}
        />
      ) : null}
      <TiptapInput
        value={value}
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
