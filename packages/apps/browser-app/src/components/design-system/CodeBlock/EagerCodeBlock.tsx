import { Theme } from "@superego/backend";
import { useEffect, useRef, useState } from "react";
import useTheme from "../../../business-logic/theme/useTheme.js";
import monaco from "../../../monaco.js";
import classnames from "../../../utils/classnames.js";
import * as cs from "./CodeBlock.css.js";
import CopyButton from "./CopyButton.js";
import formatJson from "./formatJson.js";
import type Props from "./Props.js";

export default function EagerCodeBlock({
  language,
  code,
  onMouseDown,
  maxHeight,
  showCopyButton,
  mirrorCodeInput,
  className,
}: Props) {
  const [isColorized, setIsColorized] = useState(false);
  const theme = useTheme();
  const codeElement = useRef<HTMLElement>(null);
  const formattedCode = language === "json" ? formatJson(code) : code;
  // We want the effect to re-run when code changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    if (codeElement.current) {
      monaco.editor
        .colorizeElement(codeElement.current, {
          theme: theme === Theme.Light ? "vs" : "vs-dark",
          tabSize: 2,
        })
        .then(() => setIsColorized(true));
    }
  }, [theme, formattedCode]);
  return (
    <div
      onMouseDown={onMouseDown}
      className={classnames(cs.EagerCodeBlock.root, className)}
      style={{
        maxHeight,
        visibility: isColorized ? undefined : "hidden",
      }}
    >
      <div className={cs.EagerCodeBlock.lineNumbers}>
        {formattedCode.split("\n").map((_, index) => (
          <div
            // Rule-ignore explanation: the index is the correct identifier
            // for a line number.
            // biome-ignore lint/suspicious/noArrayIndexKey: see above.
            key={index}
            className={cs.EagerCodeBlock.lineNumber}
            style={mirrorCodeInput ? { paddingInlineEnd: 26 } : undefined}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <pre className={cs.EagerCodeBlock.pre}>
        <code
          key={theme + formattedCode}
          data-lang={language}
          ref={codeElement}
        >
          {formattedCode}
        </code>
      </pre>
      {showCopyButton ? <CopyButton code={formattedCode} /> : null}
    </div>
  );
}
