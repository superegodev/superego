import type { OverTypeInstance } from "overtype";
import OverType from "overtype";
import { useEffect, useRef } from "react";
import { FieldErrorContext } from "react-aria-components";
import { useController } from "react-hook-form";
import { FieldError } from "../../../../design-system/forms/forms.js";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<OverTypeInstance | null>(null);
  const fieldRef = useRef(field);
  fieldRef.current = field;

  useEffect(() => {
    if (!containerRef.current) return;

    const [instance] = OverType.init(containerRef.current, {
      value: fieldRef.current.value ?? "",
      onChange: (value) => {
        fieldRef.current.onChange(value !== "" ? value : null);
      },
      autoResize: true,
      toolbar: true,
      smartLists: true,
      placeholder: "null",
    });
    editorRef.current = instance ?? null;

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (
      editorRef.current &&
      (field.value ?? "") !== editorRef.current.getValue()
    ) {
      editorRef.current.setValue(field.value ?? "");
    }
  }, [field.value]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (isReadOnly) {
      editorRef.current.showPreviewMode();
    } else {
      editorRef.current.showNormalEditMode();
    }
  }, [isReadOnly]);

  return (
    <div
      className={cs.StringField.Markdown.root}
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
      <div ref={containerRef} onBlur={field.onBlur} />
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
