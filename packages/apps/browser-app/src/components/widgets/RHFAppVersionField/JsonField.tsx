import { useState, useCallback } from "react";
import { useController, type Control } from "react-hook-form";
import CodeInput from "../CodeInput/CodeInput.js";
import * as cs from "./RHFAppVersionField.css.js";

export default function JsonField({
  control,
  name,
  label,
}: {
  control: Control;
  name: string;
  label: string;
}) {
  const { field, fieldState } = useController({ control, name });
  const [text, setText] = useState(
    () => JSON.stringify(field.value, null, 2) ?? "",
  );
  const onFieldChange = field.onChange;
  const onChange = useCallback(
    (value: string) => {
      setText(value);
      try {
        onFieldChange(JSON.parse(value));
      } catch {
        onFieldChange(value);
      }
    },
    [onFieldChange],
  );
  const [previousValue, setPreviousValue] = useState(field.value);
  if (previousValue !== field.value) {
    setPreviousValue(field.value);
    setText((previous) => {
      if (previous === field.value) {
        return previous;
      }
      try {
        if (
          JSON.stringify(JSON.parse(previous)) === JSON.stringify(field.value)
        ) {
          return previous;
        }
      } catch {
        /* A form reset replaces invalid input. */
      }
      return JSON.stringify(field.value, null, 2) ?? "";
    });
  }
  return (
    <div className={cs.JsonField.root}>
      <label>{label}</label>
      <CodeInput
        language="json"
        ariaLabel={label}
        filePath={`/${name}.json`}
        value={text}
        maxHeight="240px"
        onChange={onChange}
        onBlur={field.onBlur}
        isInvalid={fieldState.invalid}
      />
      {fieldState.error ? <p role="alert">{fieldState.error.message}</p> : null}
    </div>
  );
}
