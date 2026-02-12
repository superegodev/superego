import { useCallback } from "react";
import { FieldErrorContext } from "react-aria-components";
import { useController } from "react-hook-form";
import classnames from "../../../../../utils/classnames.js";
import { FieldError } from "../../../../design-system/forms/forms.js";
import MarkdownInput from "../../../../design-system/MarkdownInput/MarkdownInput.js";
import AnyFieldLabel from "../../AnyFieldLabel.js";
import * as cs from "../../RHFContentField.css.js";
import { useUiOptions } from "../../uiOptions.js";
import type Props from "../Props.js";

export default function Markdown({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { isReadOnly } = useUiOptions();
  const { field, fieldState } = useController({ control, name });
  const fieldOnChange = field.onChange;
  const onChange = useCallback(
    (newValue: string) => fieldOnChange(newValue !== "" ? newValue : null),
    [fieldOnChange],
  );
  return (
    <div
      className={classnames(
        cs.StringField.Markdown.root,
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
          htmlFor={field.name}
        />
      ) : null}
      <MarkdownInput
        value={field.value ?? ""}
        onChange={onChange}
        onBlur={field.onBlur}
        id={field.name}
        isInvalid={fieldState.invalid}
        isReadOnly={isReadOnly}
        placeholder="null"
        ref={field.ref}
      />
      <FieldErrorContext
        value={{
          isInvalid: fieldState.invalid,
          validationErrors: fieldState.error?.message
            ? [fieldState.error.message]
            : [],
          validationDetails: {} as ValidityState,
        }}
      >
        <FieldError>{fieldState.error?.message}</FieldError>
      </FieldErrorContext>
    </div>
  );
}
