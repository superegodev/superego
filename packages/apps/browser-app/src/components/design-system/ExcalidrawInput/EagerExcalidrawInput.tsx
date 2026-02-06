import "@excalidraw/excalidraw/index.css";
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawProps } from "@excalidraw/excalidraw/types";
import { useCallback, useEffect, useRef } from "react";
import forms from "../../../business-logic/forms/forms.js";
import * as cs from "./ExcalidrawInput.css.js";
import type Props from "./Props.js";

export default function EagerExcalidrawInput({
  value,
  onChange,
  onBlur,
  autoFocus,
  isInvalid = false,
  isReadOnly = false,
  ref,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (rootRef.current && ref) {
      ref({
        focus: () => {
          rootRef.current?.focus();
        },
      });
    }
  }, [ref]);
  useEffect(() => {
    if (autoFocus) {
      rootRef.current?.focus();
    }
  }, [autoFocus]);
  const handleChange = useCallback<NonNullable<ExcalidrawProps["onChange"]>>(
    (elements, appState, files) => {
      onChange({ elements, appState, files });
    },
    [onChange],
  );
  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className={cs.ExcalidrawInput.root}
      data-invalid={isInvalid}
      onBlur={onBlur}
    >
      <Excalidraw
        initialData={value ?? forms.defaults.excalidrawDrawingJsonObject()}
        onChange={handleChange}
        viewModeEnabled={isReadOnly}
      />
    </div>
  );
}
