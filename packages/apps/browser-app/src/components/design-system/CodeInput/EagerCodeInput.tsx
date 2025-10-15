import { useEffect, useRef } from "react";
import * as cs from "./CodeInput.css.js";
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
  ariaLabel,
  typescriptLibs,
  includedGlobalUtils,
  fileName,
  assistantImplementation,
  maxHeight,
  ref,
}: Props) {
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
      onBlur={onBlur}
      aria-invalid={isInvalid}
      aria-disabled={isDisabled}
      inert={isDisabled}
      className={cs.EagerCodeInput.root}
      data-testid="code-input"
    >
      {language === "typescript" ? (
        <TypescriptEditor
          value={value}
          onChange={onChange}
          ariaLabel={ariaLabel}
          typescriptLibs={typescriptLibs}
          includedGlobalUtils={includedGlobalUtils}
          fileName={fileName}
          assistantImplementation={assistantImplementation}
          maxHeight={maxHeight}
        />
      ) : (
        <JsonEditor
          value={value}
          onChange={onChange}
          ariaLabel={ariaLabel}
          fileName={fileName}
          maxHeight={maxHeight}
        />
      )}
    </div>
  );
}
