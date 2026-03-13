import OverType, { type OverTypeInstance } from "overtype";
import { useEffect, useRef, useState } from "react";
import { useFocusVisible } from "react-aria";
import Description from "../forms/Description.js";
import Label from "../forms/Label.js";
import FormattingToolbar from "./FormattingToolbar.js";
import * as cs from "./MarkdownField.css.js";
import type Props from "./Props.js";
import theme from "./theme.js";
import useActiveFormats from "./useActiveFormats.js";

export default function EagerMarkdownField({
  value,
  onChange,
  label,
  ariaLabel,
  description,
  placeholder,
  isDisabled = false,
}: Props) {
  const { isFocusVisible } = useFocusVisible();
  const [hasFocus, setHasFocus] = useState(false);
  const editorRef = useRef<OverTypeInstance | null>(null);
  const activeFormats = useActiveFormats(editorRef);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootElementRef = useRef<HTMLDivElement>(null);

  // When value, onChange, or placeholder change, the editor's references are
  // updated by other hooks.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const [instance] = OverType.init(containerRef.current, {
      value: value ?? "",
      onChange: (newValue) => onChange(newValue === "" ? null : newValue),
      autoResize: true,
      toolbar: false,
      smartLists: true,
      placeholder: placeholder ?? "",
      theme,
      padding: "8px 16px 16px 16px",
      fontSize: "16px",
      spellcheck: true,
      textareaProps: {
        readOnly: isDisabled,
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
      },
    });
    editorRef.current = instance ?? null;

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && (value ?? "") !== editor.getValue()) {
      editor.setValue(value ?? "");
    }
  }, [value]);

  useEffect(() => {
    editorRef.current?.reinit({
      onChange: (newValue) => onChange(newValue === "" ? null : newValue),
      placeholder: placeholder ?? "",
    });
  }, [onChange, placeholder]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.textarea.readOnly = isDisabled;
    }
  }, [isDisabled]);

  return (
    <div
      data-disabled={isDisabled || undefined}
      className={cs.MarkdownField.root}
    >
      {label ? <Label>{label}</Label> : null}
      <div
        ref={rootElementRef}
        onFocus={() => setHasFocus(true)}
        onBlur={(evt) => {
          const focusPassedToChild = rootElementRef.current?.contains(
            evt.relatedTarget,
          );
          if (!focusPassedToChild) {
            setHasFocus(false);
          }
        }}
        data-has-focus={hasFocus}
        data-focus-visible={hasFocus && isFocusVisible}
        className={cs.MarkdownInput.root}
      >
        {!isDisabled ? (
          <FormattingToolbar
            editorRef={editorRef}
            activeFormats={activeFormats}
          />
        ) : null}
        <div ref={containerRef} />
      </div>
      {description ? <Description>{description}</Description> : null}
    </div>
  );
}
