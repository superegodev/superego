import { Theme, type TypescriptModule } from "@superego/backend";
import type { Property } from "csstype";
import * as monaco from "monaco-editor";
import { type MouseEventHandler, useEffect, useRef, useState } from "react";
import useTheme from "../../../business-logic/theme/useTheme.js";
import * as cs from "./TypescriptModuleInput.css.js";

interface Props {
  isShown: boolean;
  value: TypescriptModule;
  onMouseDown: MouseEventHandler<HTMLDivElement>;
  maxHeight?: Property.MaxHeight;
}
export default function ReadOnly({
  isShown,
  value,
  onMouseDown,
  maxHeight,
}: Props) {
  const [isColorized, setIsColorized] = useState(false);
  const theme = useTheme();
  const codeElement = useRef<HTMLElement>(null);
  // Rule-ignore explanation: we want the effect to re-run when value.source
  // changes.
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
  }, [theme, value.source]);
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        display: isShown && isColorized ? undefined : "none",
        maxHeight,
      }}
      className={cs.ReadOnly.root}
    >
      <div className={cs.ReadOnly.lineNumbers}>
        {value.source.split("\n").map((_, index) => (
          // Rule-ignore explanation: the index is the correct identifier for a
          // line number.
          // biome-ignore lint/suspicious/noArrayIndexKey: see above.
          <div key={index} className={cs.ReadOnly.lineNumber}>
            {index + 1}
          </div>
        ))}
      </div>
      <code
        key={theme + value.source}
        data-lang="typescript"
        ref={codeElement}
        className={cs.ReadOnly.code}
      >
        {value.source}
      </code>
    </div>
  );
}
