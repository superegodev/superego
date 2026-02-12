import OverType from "overtype";
import { useEffect, useRef, useState } from "react";
import { useFocusVisible } from "react-aria";
import FormattingToolbar from "./FormattingToolbar.js";
import * as cs from "./MarkdownInput.css.js";
import type OverTypeEditor from "./OverTypeEditor.js";
import type Props from "./Props.js";
import theme from "./theme.js";

export default function EagerMarkdownInput({
  value,
  onChange,
  onBlur,
  id,
  isInvalid = false,
  isReadOnly = false,
  showToolbar = true,
  placeholder,
  ref,
}: Props) {
  const { isFocusVisible } = useFocusVisible();
  const [hasFocus, setHasFocus] = useState(false);
  const editorRef = useRef<OverTypeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rootElementRef = useRef<HTMLDivElement>(null);

  // When value, onChange, or placeholder change, they editor's references are
  // updated by other hooks.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const [instance] = OverType.init(containerRef.current, {
      value: value ?? "",
      onChange: (newValue) => onChange(newValue),
      autoResize: true,
      toolbar: false,
      smartLists: true,
      placeholder: placeholder ?? "",
      theme,
      textareaProps: { id: id, readOnly: isReadOnly },
    });
    editorRef.current = (instance ?? null) as OverTypeEditor | null;

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
      onChange: (newValue) => onChange(newValue),
      placeholder: placeholder,
    });
  }, [onChange, placeholder]);

  useEffect(() => {
    if (editorRef.current && id) {
      editorRef.current.textarea.id = id;
    }
  }, [id]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.textarea.readOnly = isReadOnly;
    }
  }, [isReadOnly]);

  useEffect(() => {
    if (rootElementRef.current && ref) {
      ref({
        focus: () => {
          if (!rootElementRef.current?.contains(document.activeElement)) {
            editorRef.current?.focus();
          }
        },
      });
    }
  }, [ref]);

  return (
    <div
      ref={rootElementRef}
      onFocus={() => setHasFocus(true)}
      onBlur={(evt) => {
        const focusPassedToChild = rootElementRef.current?.contains(
          evt.relatedTarget,
        );
        if (!focusPassedToChild) {
          setHasFocus(false);
          onBlur?.();
        }
      }}
      aria-invalid={isInvalid}
      data-has-focus={hasFocus}
      data-focus-visible={hasFocus && isFocusVisible}
      data-read-only={isReadOnly}
      className={cs.MarkdownInput.root}
    >
      {showToolbar && !isReadOnly ? (
        <FormattingToolbar editorRef={editorRef} />
      ) : null}
      <div ref={containerRef} />
    </div>
  );
}
