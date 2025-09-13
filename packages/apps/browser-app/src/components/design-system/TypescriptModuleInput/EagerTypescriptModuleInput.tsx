import { useEffect, useRef, useState } from "react";
import type monaco from "../../../monaco.js";
import type Props from "./Props.js";
import ReadOnly from "./ReadOnly.js";
import ReadWrite from "./ReadWrite.js";
import * as cs from "./TypescriptModuleInput.css.js";

export default function TypescriptModuleInput({
  value,
  onChange,
  onBlur,
  autoFocus,
  isInvalid = false,
  isDisabled = false,
  typescriptLibs,
  includedGlobalUtils,
  maxHeight,
  ref,
}: Props) {
  const [mode, setMode] = useState<"readOnly" | "readWrite">("readOnly");
  const initialPositionRef = useRef<monaco.IPosition>(null);
  const rootElementRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (rootElementRef.current) {
      ref?.({
        focus: () => {
          if (!rootElementRef.current?.contains(document.activeElement)) {
            rootElementRef.current?.focus();
          }
        },
      });
      if (autoFocus) {
        rootElementRef.current.focus();
      }
    }
  }, [autoFocus, ref]);
  return (
    <div
      tabIndex={0}
      ref={rootElementRef}
      onFocus={() => setMode("readWrite")}
      // A blur event (technically, a focusout) is emitted every time either
      // this element or any of its children lose focus. This means that, for
      // example, we get a blur event even when the focus passes from one child
      // element of the ReadWrite component to another child element of
      // ReadWrite. We don't want to set the mode to readOnly when that occurs.
      // Hence, when we get a blur event, we trigger the mode change only if the
      // element which will receive focus is an "outside" element.
      onBlur={(evt) => {
        if (!rootElementRef.current?.contains(evt.relatedTarget)) {
          setMode("readOnly");
          onBlur?.();
        }
      }}
      aria-invalid={isInvalid}
      aria-disabled={isDisabled}
      className={cs.TypescriptModuleInput.root}
    >
      <ReadWrite
        isShown={mode === "readWrite" && !isDisabled}
        value={value}
        onChange={onChange}
        typescriptLibs={typescriptLibs}
        includedGlobalUtils={includedGlobalUtils}
        initialPositionRef={initialPositionRef}
        maxHeight={maxHeight}
      />
      <ReadOnly
        isShown={mode === "readOnly" || isDisabled}
        value={value}
        onMouseDown={({ nativeEvent: { clientX, clientY } }) => {
          if (rootElementRef.current) {
            const containerRect =
              rootElementRef.current.getBoundingClientRect();
            initialPositionRef.current = positionFromClickCoords(
              clientX - containerRect.left,
              clientY - containerRect.top,
            );
          }
        }}
        maxHeight={maxHeight}
      />
    </div>
  );
}

function positionFromClickCoords(x: number, y: number): monaco.IPosition {
  return {
    lineNumber: 1 + Math.floor(Math.max(0, (y - 8) / 21)),
    column: 1 + Math.round(Math.max(0, (x - 51) / 8.5)),
  };
}
