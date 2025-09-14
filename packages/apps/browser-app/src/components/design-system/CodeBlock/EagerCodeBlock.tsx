import { Theme } from "@superego/backend";
import { useEffect, useRef } from "react";
import useTheme from "../../../business-logic/theme/useTheme.js";
import monaco from "../../../monaco.js";
import * as cs from "./CodeBlock.css.js";
import type Props from "./Props.js";

export default function EagerCodeBlock({
  language,
  code,
  onMouseDown,
  maxHeight,
  mirrorCodeInput,
}: Props) {
  const theme = useTheme();
  const codeElement = useRef<HTMLElement>(null);
  // Rule-ignore explanation: we want the effect to re-run when code changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    if (codeElement.current) {
      monaco.editor.colorizeElement(codeElement.current, {
        theme: theme === Theme.Light ? "vs" : "vs-dark",
        tabSize: 2,
      });
    }
  }, [theme, code]);
  return (
    <div
      onMouseDown={onMouseDown}
      className={cs.CodeBlock.root}
      style={{ maxHeight }}
    >
      <div className={cs.CodeBlock.lineNumbers}>
        {code.split("\n").map((_, index) => (
          <div
            // Rule-ignore explanation: the index is the correct identifier
            // for a line number.
            // biome-ignore lint/suspicious/noArrayIndexKey: see above.
            key={index}
            className={cs.CodeBlock.lineNumber}
            style={mirrorCodeInput ? { paddingInlineEnd: 26 } : undefined}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <code
        key={theme + code}
        data-lang={language}
        ref={codeElement}
        className={cs.CodeBlock.code}
      >
        {code}
      </code>
    </div>
  );
}
