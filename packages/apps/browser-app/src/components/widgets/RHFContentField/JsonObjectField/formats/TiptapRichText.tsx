import { DataType } from "@superego/schema";
import type { JSONContent } from "@tiptap/react";
import { useCallback } from "react";
import { FieldErrorContext } from "react-aria-components";
import { useController } from "react-hook-form";
import { FieldError } from "../../../../design-system/forms/forms.js";
import TiptapInput from "../../../../design-system/TiptapInput/TiptapInput.jsx";
import AnyFieldLabel from "../../AnyFieldLabel.jsx";
import * as cs from "../../RHFContentField.css.js";
import type Props from "../Props.js";

export default function TiptapRichText({
  typeDefinition,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { field, fieldState } = useController({ control, name });
  const { __dataType, ...value } = field.value ?? { type: "doc", content: [] };
  const onChange = useCallback(
    (newValue: JSONContent) =>
      field.onChange({ ...newValue, __dataType: DataType.JsonObject }),
    [field.onChange],
  );
  return (
    <div className={cs.JsonObjectField.TiptapRichText.root}>
      {!isListItem ? (
        <AnyFieldLabel typeDefinition={typeDefinition} label={label} />
      ) : null}
      <TiptapInput
        value={value}
        onChange={onChange}
        onBlur={field.onBlur}
        isInvalid={fieldState.invalid}
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
