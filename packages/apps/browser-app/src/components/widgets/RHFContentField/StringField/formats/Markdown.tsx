import OverType, { type OverTypeInstance } from "overtype";
import { useCallback, useEffect, useRef } from "react";
import { useController } from "react-hook-form";
import classnames from "../../../../../utils/classnames.js";
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
  const isInternalChange = useRef(false);

  const handleChange = useCallback(
    (value: string) => {
      isInternalChange.current = true;
      field.onChange(value !== "" ? value : null);
    },
    [field],
  );

  useEffect(() => {
    if (!containerRef.current || editorRef.current) {
      return;
    }

    const [editor] = new OverType(containerRef.current, {
      value: field.value ?? "",
      toolbar: !isReadOnly,
      autoResize: true,
      minHeight: "150px",
      placeholder: "null",
      onChange: handleChange,
      textareaProps: {
        "aria-label": isListItem ? label : undefined,
        "aria-invalid": fieldState.invalid || undefined,
        readOnly: isReadOnly,
      },
    });

    editorRef.current = editor ?? null;

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [field.value, fieldState.invalid, handleChange, isListItem, isReadOnly, label]);

  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      const currentValue = editorRef.current.getValue();
      const newValue = field.value ?? "";
      if (currentValue !== newValue) {
        editorRef.current.setValue(newValue);
      }
    }
    isInternalChange.current = false;
  }, [field.value]);

  useEffect(() => {
    if (editorRef.current && isReadOnly) {
      editorRef.current.showPreviewMode();
    } else if (editorRef.current && !isReadOnly) {
      editorRef.current.showNormalEditMode();
    }
  }, [isReadOnly]);

  return (
    <div
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      className={classnames(
        cs.StringField.Markdown.root,
        isListItem && cs.ListItemField.root,
      )}
    >
      {!isListItem ? (
        <AnyFieldLabel
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          label={label}
        />
      ) : null}
      <div
        ref={containerRef}
        className={cs.StringField.Markdown.editor}
        onBlur={field.onBlur}
      />
      <FieldError>{fieldState.error?.message}</FieldError>
    </div>
  );
}
