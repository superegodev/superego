import OverType from "overtype";
import { useEffect, useRef, useState } from "react";
import FormattingToolbar from "./FormattingToolbar.js";
import * as cs from "./MarkdownInput.css.js";
import type OverTypeEditor from "./OverTypeEditor.js";
import type Props from "./Props.js";
import theme from "./theme.js";

export default function EagerMarkdownInput({
  value,
  onChange,
  onBlur,
  isInvalid = false,
  isReadOnly = false,
  placeholder,
  ref,
}: Props) {
  const [hasFocus, setHasFocus] = useState(false);
  const [editor, setEditor] = useState<OverTypeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ onChange, value, placeholder });
  propsRef.current = { onChange, value, placeholder };

  useEffect(() => {
    if (!containerRef.current) return;

    const [instance] = OverType.init(containerRef.current, {
      value: propsRef.current.value ?? "",
      onChange: (newValue) => {
        propsRef.current.onChange(newValue);
      },
      autoResize: true,
      toolbar: false,
      smartLists: true,
      placeholder: propsRef.current.placeholder ?? "",
      theme,
    });
    const editorInstance = (instance ?? null) as OverTypeEditor | null;
    setEditor(editorInstance);

    return () => {
      editorInstance?.destroy();
      setEditor(null);
    };
  }, []);

  useEffect(() => {
    if (editor && (value ?? "") !== editor.getValue()) {
      editor.setValue(value ?? "");
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    if (isReadOnly) {
      editor.showPreviewMode();
    } else {
      editor.showNormalEditMode();
    }
  }, [editor, isReadOnly]);

  const rootElementRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (rootElementRef.current && ref) {
      ref({
        focus: () => {
          if (!rootElementRef.current?.contains(document.activeElement)) {
            editor?.focus();
          }
        },
      });
    }
  }, [editor, ref]);

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
      data-read-only={isReadOnly}
      className={cs.MarkdownInput.root}
    >
      {!isReadOnly && editor ? <FormattingToolbar editor={editor} /> : null}
      <div ref={containerRef} />
    </div>
  );
}
