import { type RefObject, useEffect, useRef } from "react";
import monaco from "../../../../monaco.js";
import { vars } from "../../../../themes.css.js";

/**
 * Creates the monaco editor instance when the component is shown, and disposes
 * it when the component is hidden.
 */
export default function useCreateEditor(
  isShown: boolean,
  codeModelRef: RefObject<monaco.editor.ITextModel | null>,
  initialPositionRef: RefObject<monaco.IPosition | null>,
  initialScrollPositionRef: RefObject<monaco.editor.INewScrollPosition | null>,
) {
  const editorElementRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);

  useEffect(() => {
    if (editorElementRef.current && isShown) {
      editorRef.current = monaco.editor.create(editorElementRef.current, {
        model: codeModelRef.current,
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

      editorRef.current.setPosition(
        initialPositionRef.current ?? { lineNumber: 1, column: 1 },
      );
      editorRef.current.setScrollPosition(
        initialScrollPositionRef.current ?? { scrollLeft: 0, scrollTop: 0 },
        monaco.editor.ScrollType.Immediate,
      );
      editorRef.current.onDidScrollChange((evt) => {
        initialScrollPositionRef.current = {
          scrollLeft: evt.scrollLeft,
          scrollTop: evt.scrollTop,
        };
      });
      // Update the initial position ref, so it restores if the user focuses
      // back to the input with their keyboard. (If they focus with the mouse,
      // the click position will be set.)
      editorRef.current.onDidChangeCursorPosition(({ position }) => {
        initialPositionRef.current = position;
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
          const { maxHeight } = window.getComputedStyle(
            editorElementRef.current,
          );
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
    }
    return () => {
      editorRef.current?.dispose();
      editorRef.current = null;
    };
  }, [
    isShown,
    // Passed in just to avoid react-hooks/exhaustive-deps complaining. Since
    // they are ref, they're stable and passing them here has no effect.
    codeModelRef,
    initialPositionRef,
    initialScrollPositionRef,
  ]);

  return { editorElementRef, editorRef };
}

function getContainerHeight(editorContentHeigh: number): number {
  const bordersWidth = 2;
  const paddingBlockEnd = 0;
  return editorContentHeigh + bordersWidth + paddingBlockEnd;
}
