import { Theme } from "@superego/backend";
import { type RefObject, useEffect, useRef } from "react";
import useTheme from "../../../../business-logic/theme/useTheme.js";
import monaco from "../../../../monaco.js";
import { vars } from "../../../../themes.css.js";

/**
 * Creates the monaco editor instance and the value model and disposes them on
 * unmount.
 */
export default function useEditor(
  basePath: string,
  language: "typescript" | "json",
  value: string,
  onChange: (newValue: string) => void,
  valueModelRef: RefObject<monaco.editor.ITextModel | null>,
  ariaLabel: string | undefined,
  filePath: `/${string}.ts` | `/${string}.tsx` | `/${string}.json`,
) {
  const editorElementRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
  const initialValueRef = useRef(value);

  useEffect(() => {
    if (!editorElementRef.current) {
      return;
    }
    valueModelRef.current = monaco.editor.createModel(
      initialValueRef.current,
      language,
      monaco.Uri.parse(`${basePath}${filePath}`),
    );

    // Propagate changes to the outside world.
    valueModelRef.current.onDidChangeContent(() => {
      const newValue = valueModelRef.current?.getValue();
      if (newValue !== undefined) {
        onChange(newValue);
      }
    });

    editorRef.current = monaco.editor.create(editorElementRef.current, {
      model: valueModelRef.current,
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
      // Accessibility
      ariaLabel: ariaLabel,
    });

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
      valueModelRef.current?.dispose();
      valueModelRef.current = null;
    };
  }, [
    basePath,
    language,
    onChange,
    // Passed in just to avoid react-hooks/exhaustive-deps complaining. Since
    // it's a ref, it's stable and passing it here has no effect.
    valueModelRef,
    ariaLabel,
    filePath,
  ]);

  // Keep editor theme in sync
  useSyncEditorTheme(editorRef);

  // Keep value model in sync.
  useSyncValueModel(valueModelRef, value);

  return { editorElementRef, valueModelRef };
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

function useSyncValueModel(
  valueModelRef: RefObject<monaco.editor.ITextModel | null>,
  value: string,
) {
  useEffect(() => {
    // Since setting the model's value resets the editor's position, the value
    // is set only when the "received" outside value differs from the current
    // model value.
    if (
      valueModelRef.current !== null &&
      valueModelRef.current.getValue() !== value
    ) {
      valueModelRef.current.setValue(value);
    }
  }, [
    value,
    // Passed in just to avoid react-hooks/exhaustive-deps complaining. Since
    // it's a ref, it's stable and passing it here has no effect.
    valueModelRef,
  ]);
}
