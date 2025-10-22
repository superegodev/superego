import { useEffect, useRef } from "react";
import classnames from "../../../utils/classnames.js";
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
  filePath,
  assistantImplementation,
  maxHeight,
  className,
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
      className={classnames(cs.EagerCodeInput.root, className)}
      data-testid="code-input"
    >
      {language === "json" ? (
        <JsonEditor
          value={value}
          onChange={onChange}
          ariaLabel={ariaLabel}
          filePath={filePath}
          maxHeight={maxHeight}
        />
      ) : (
        <TypescriptEditor
          language={language}
          value={value}
          onChange={onChange}
          ariaLabel={ariaLabel}
          typescriptLibs={typescriptLibs}
          includedGlobalUtils={includedGlobalUtils}
          filePath={filePath}
          assistantImplementation={assistantImplementation}
          maxHeight={maxHeight}
        />
      )}
    </div>
  );
}
