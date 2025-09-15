import { useEffect, useRef, useState } from "react";
import forms from "../../../business-logic/forms/forms.js";
import type monaco from "../../../monaco.js";
import EagerCodeBlock from "../CodeBlock/EagerCodeBlock.js";
import * as cs from "./CodeInput.css.js";
import CompilationInProgressIndicator from "./CompilationInProgressIndicator.js";
import JsonEditor from "./json/JsonEditor.js";
import type Props from "./Props.js";
import TypescriptEditor from "./typescript/TypescriptEditor.js";

export default function EagerCodeInput({
  language,
  value,
  onChange,
  onBlur,
  autoFocus,
  isInvalid = false,
  isDisabled = false,
  typescriptLibs,
  includedGlobalUtils,
  codeFileName,
  maxHeight,
  ref,
}: Props) {
  const [mode, setMode] = useState<"readOnly" | "readWrite">("readOnly");
  const initialPositionRef = useRef<monaco.IPosition>(null);
  const initialScrollPositionRef = useRef<monaco.editor.INewScrollPosition>({
    scrollLeft: 0,
    scrollTop: 0,
  });
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
  // Sync back *Editor scroll position with CodeBlock's.
  useEffect(() => {
    if (mode === "readOnly" && rootElementRef.current) {
      const codeBlockCode = rootElementRef.current.querySelector("code");
      const codeBlockRoot = codeBlockCode?.parentElement;
      codeBlockRoot?.scrollTo({
        top: initialScrollPositionRef.current.scrollTop,
      });
      // Scrolling left doesn't work. The behavior is acceptable, though.
      // codeBlockCode?.scrollTo({
      //   left: initialScrollPositionRef.current.scrollLeft,
      // });
    }
  }, [mode]);
  return (
    <div
      tabIndex={0}
      ref={rootElementRef}
      onFocus={() => setMode("readWrite")}
      // A blur event (technically, a focusout) is emitted every time either
      // this element or any of its children lose focus. This means that, for
      // example, we get a blur event even when the focus passes from one child
      // element of the *Editor component to another child element of *Editor.
      // We don't want to set the mode to readOnly when that occurs. Hence, when
      // we get a blur event, we trigger the mode change only if the element
      // which will receive focus is an "outside" element.
      onBlur={(evt) => {
        if (!rootElementRef.current?.contains(evt.relatedTarget)) {
          setMode("readOnly");
          onBlur?.();
        }
      }}
      aria-invalid={isInvalid}
      aria-disabled={isDisabled}
      className={cs.CodeInput.root}
    >
      {language === "typescript" ? (
        <TypescriptEditor
          isShown={mode === "readWrite" && !isDisabled}
          value={value}
          onChange={onChange}
          typescriptLibs={typescriptLibs}
          includedGlobalUtils={includedGlobalUtils}
          codeFileName={codeFileName}
          initialPositionRef={initialPositionRef}
          initialScrollPositionRef={initialScrollPositionRef}
          maxHeight={maxHeight}
        />
      ) : (
        <JsonEditor
          isShown={mode === "readWrite" && !isDisabled}
          value={value}
          onChange={onChange}
          codeFileName={codeFileName}
          initialPositionRef={initialPositionRef}
          initialScrollPositionRef={initialScrollPositionRef}
          maxHeight={maxHeight}
        />
      )}
      {mode === "readOnly" || isDisabled ? (
        <EagerCodeBlock
          language={language}
          code={language === "typescript" ? value.source : value}
          onMouseDown={({ target, nativeEvent: { clientX, clientY } }) => {
            let scrollLeft = 0;
            let scrollTop = 0;
            if (target instanceof HTMLElement) {
              const codeBlockCode = target.closest("code");
              const codeBlockRoot = codeBlockCode?.parentElement;
              scrollLeft = codeBlockCode?.scrollLeft ?? 0;
              scrollTop = codeBlockRoot?.scrollTop ?? 0;
              initialScrollPositionRef.current = { scrollLeft, scrollTop };
            }
            if (rootElementRef.current) {
              const containerRect =
                rootElementRef.current.getBoundingClientRect();
              initialPositionRef.current = positionFromClickCoords(
                scrollLeft + clientX - containerRect.left,
                scrollTop + clientY - containerRect.top,
              );
            }
          }}
          maxHeight={maxHeight}
          mirrorCodeInput={true}
        />
      ) : null}
      {language === "typescript" &&
      value.compiled === forms.constants.IN_PROGRESS_COMPILATION_OUTPUT ? (
        <CompilationInProgressIndicator />
      ) : null}
    </div>
  );
}

function positionFromClickCoords(x: number, y: number): monaco.IPosition {
  return {
    lineNumber: 1 + Math.floor(Math.max(0, (y - 8) / 21)),
    column: 1 + Math.round(Math.max(0, (x - 51) / 8.5)),
  };
}
