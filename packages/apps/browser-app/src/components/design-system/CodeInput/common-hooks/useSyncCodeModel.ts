import type { TypescriptModule } from "@superego/backend";
import { type RefObject, useEffect, useRef } from "react";
import monaco from "../../../../monaco.js";

/**
 * Creates the model for the code when the component is shown, and disposes it
 * when it's hidden.
 */
export default function useSyncCodeModel(
  editorBasePath: string,
  isShown: boolean,
  code:
    | { language: "typescript"; value: TypescriptModule }
    | { language: "json"; value: string },
  readyToDisposeRef?: RefObject<Promise<string> | null>,
): { codeModelRef: RefObject<monaco.editor.ITextModel | null> } {
  const codeModelRef = useRef<monaco.editor.ITextModel>(null);
  const source =
    code.language === "typescript" ? code.value.source : code.value;
  const extension = code.language === "typescript" ? ".ts" : ".json";

  useEffect(() => {
    if (!isShown) {
      return;
    }

    if (codeModelRef.current === null) {
      const sourceModel = monaco.editor.createModel(
        source,
        code.language,
        monaco.Uri.parse(`${editorBasePath}/main${extension}`),
      );
      codeModelRef.current = sourceModel;
    } else if (codeModelRef.current.getValue() !== source) {
      // Since setting the model's value resets the editor's position, the
      // value is set only when the "received" outside value differs from the
      // current model value.
      codeModelRef.current.setValue(source);
    }
  }, [isShown, code.language, extension, source, editorBasePath]);

  // Dispose the model and reset its ref whenever isShown changes.
  useEffect(() => {
    return isShown
      ? () => {
          (async () => {
            if (readyToDisposeRef) {
              await readyToDisposeRef.current;
            }
            codeModelRef.current?.dispose();
            codeModelRef.current = null;
          })();
        }
      : undefined;
  }, [isShown, readyToDisposeRef]);

  return { codeModelRef };
}
