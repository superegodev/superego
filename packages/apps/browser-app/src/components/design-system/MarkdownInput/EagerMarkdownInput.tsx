import type { OverTypeInstance } from "overtype";
import OverType from "overtype";
import { useEffect, useRef, useState } from "react";
import * as cs from "./MarkdownInput.css.js";
import type Props from "./Props.js";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<OverTypeInstance | null>(null);
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
      toolbar: true,
      smartLists: true,
      placeholder: propsRef.current.placeholder ?? "",
    });
    editorRef.current = instance ?? null;

    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && (value ?? "") !== editorRef.current.getValue()) {
      editorRef.current.setValue(value ?? "");
    }
  }, [value]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (isReadOnly) {
      editorRef.current.showPreviewMode();
    } else {
      editorRef.current.showNormalEditMode();
    }
  }, [isReadOnly]);

  const rootElementRef = useRef<HTMLDivElement>(null);
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
      data-read-only={isReadOnly}
      className={cs.MarkdownInput.root}
    >
      <div ref={containerRef} />
    </div>
  );
}
