import { Theme } from "@superego/backend";
import { type RefObject, useEffect } from "react";
import useTheme from "../../../../business-logic/theme/useTheme.js";
import type monaco from "../../../../monaco.js";

/** Keeps the editor theme in sync with the app theme. */
export default function useSyncEditorTheme(
  editorRef: RefObject<monaco.editor.IStandaloneCodeEditor | null>,
) {
  const theme = useTheme();
  useEffect(() => {
    editorRef.current?.updateOptions({
      theme: theme === Theme.Light ? "vs" : "vs-dark",
    });
  }, [
    theme,
    // Passed in just to avoid react-hooks/exhaustive-deps complaining. Since
    // it's a ref, it's stable and passing it here has no effect.
    editorRef,
  ]);
}
