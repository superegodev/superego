import { Theme } from "@superego/backend";
import { type RefObject, useEffect, useRef } from "react";
import useTheme from "../../../../business-logic/theme/useTheme.js";
import monaco from "../../../../monaco.js";
import { vars } from "../../../../themes.css.js";

/**
 * Creates the monaco editor instance and the source model and disposes them on
 * unmount.
 */
export default function useEditor(
  basePath: string,
  language: "typescript" | "json",
  source: string,
  fileName: `${string}.ts` | `${string}.json` = language === "typescript"
    ? "main.ts"
    : "main.json",
) {
  const editorElementRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const sourceModelRef = useRef<monaco.editor.ITextModel>(null);

  useEffect(() => {
    if (!editorElementRef.current) {
      return;
    }
    sourceModelRef.current = monaco.editor.createModel(
      "",
      language,
      monaco.Uri.parse(`${basePath}/${fileName}`),
    );
    editorRef.current = monaco.editor.create(editorElementRef.current, {
      model: sourceModelRef.current,
      // Appearance
      padding: { top: 8, bottom: 8 },
      minimap: { enabled: false },
      lineNumbersMinChars: 3,
      overviewRulerLanes: 0,
      fontFamily: vars.typography.fontFamilies.monospace,
      // vars.typography.fontSizes.md = 14px. We need to set it as a number
      // since that's what the monaco-editor accepts.
      fontSize: 14,
      renderWhitespace: "boundary",
      renderLineHighlightOnlyWhenFocus: true,
      renderFinalNewline: "on",
      // Behavior
      tabSize: 2,
      definitionLinkOpensInPeek: true,
      stickyScroll: { enabled: false },
      scrollBeyondLastLine: false,
      scrollbar: {
        vertical: "hidden",
        alwaysConsumeMouseWheel: false,
      },
      automaticLayout: true,
    });

    editorRef.current.focus();

    // Set initial height, auto-resize on content change, and show/hide the
    // vertical scrollbar. (If the container has no max-height, then the
    // scrollbar is never needed. If it has a max-height, the scrollbar is
    // needed when the content height makes the container exceed its
    // max-height.)
    const initialHeight = editorRef.current.getContentHeight();
    editorElementRef.current.style.height = `${getContainerHeight(initialHeight)}px`;
    editorRef.current.onDidContentSizeChange(({ contentHeight }) => {
      if (editorElementRef.current && editorRef.current) {
        const scrollTop = editorRef.current.getScrollTop();
        editorRef.current.setScrollTop(0);
        const containerHeight = getContainerHeight(contentHeight);
        const { maxHeight } = window.getComputedStyle(editorElementRef.current);
        editorElementRef.current.style.height = `${containerHeight}px`;
        if (maxHeight.endsWith("px")) {
          const exceedsMaxHeight =
            containerHeight > Number.parseFloat(maxHeight);
          editorRef.current.updateOptions({
            scrollbar: { vertical: exceedsMaxHeight ? "visible" : "hidden" },
          });
          if (exceedsMaxHeight) {
            editorRef.current.setScrollTop(scrollTop);
          }
        }
      }
    });
    return () => {
      editorRef.current?.dispose();
      editorRef.current = null;
      sourceModelRef.current?.dispose();
      sourceModelRef.current = null;
    };
  }, [basePath, language, fileName]);

  // Keep editor theme in sync
  useSyncEditorTheme(editorRef);

  // Keep source model in sync.
  useSyncSourceModel(sourceModelRef, source);

  return { editorElementRef, sourceModelRef };
}

function getContainerHeight(editorContentHeigh: number): number {
  const bordersWidth = 2;
  const paddingBlockEnd = 0;
  return editorContentHeigh + bordersWidth + paddingBlockEnd;
}

function useSyncEditorTheme(
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

function useSyncSourceModel(
  sourceModelRef: RefObject<monaco.editor.ITextModel | null>,
  source: string,
) {
  // Keep source model in sync.
  useEffect(() => {
    // Since setting the model's value resets the editor's position, the value
    // is set only when the "received" outside value differs from the current
    // model value.
    if (
      sourceModelRef.current !== null &&
      sourceModelRef.current.getValue() !== source
    ) {
      sourceModelRef.current.setValue(source);
    }
  }, [
    source,
    // Passed in just to avoid react-hooks/exhaustive-deps complaining. Since
    // it's a ref, it's stable and passing it here has no effect.
    sourceModelRef,
  ]);
}
