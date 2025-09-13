import { Theme, type TypescriptModule } from "@superego/backend";
import type { Property } from "csstype";
import pDebounce from "p-debounce";
import { type RefObject, useEffect, useRef } from "react";
import forms from "../../../business-logic/forms/forms.js";
import useTheme from "../../../business-logic/theme/useTheme.js";
import { MONACO_EDITOR_ON_DID_CHANGE_CONTENT_DEBOUNCE } from "../../../config.js";
import monaco from "../../../monaco.js";
import { vars } from "../../../themes.css.js";
import isEmpty from "../../../utils/isEmpty.js";
import type IncludedGlobalUtils from "./IncludedGlobalUtils.js";
import { getGlobalUtilsTypescriptLibs } from "./IncludedGlobalUtils.js";
import type TypescriptLib from "./TypescriptLib.js";

interface Props {
  isShown: boolean;
  value: TypescriptModule;
  onChange: (newValue: TypescriptModule) => void;
  typescriptLibs: TypescriptLib[] | undefined;
  includedGlobalUtils: IncludedGlobalUtils | undefined;
  initialPositionRef: RefObject<monaco.IPosition | null>;
  maxHeight: Property.MaxHeight | undefined;
}
export default function ReadWrite({
  isShown,
  value,
  onChange,
  typescriptLibs,
  includedGlobalUtils,
  initialPositionRef,
  maxHeight,
}: Props) {
  const latestContentChangeProcessingPromise = useRef<Promise<void> | null>(
    null,
  );
  useSyncTypescriptLibsModels(
    isShown,
    typescriptLibs,
    includedGlobalUtils,
    latestContentChangeProcessingPromise,
  );
  const { sourceModelRef } = useSyncSourceModel(
    isShown,
    value,
    onChange,
    latestContentChangeProcessingPromise,
  );
  const { editorElementRef, editorRef } = useCreateEditor(
    isShown,
    sourceModelRef,
    initialPositionRef,
  );
  useSyncEditorTheme(editorRef);
  return (
    <div
      style={{ display: !isShown ? "none" : undefined, maxHeight }}
      ref={editorElementRef}
    />
  );
}

///////////////
// Constants //
///////////////

const uriScheme = "vfs:";

///////////
// Hooks //
///////////

/*
 * Creates models for typescriptLibs when the component is shown, keeps them in
 * sync, and removes them afterwards.
 */
function useSyncTypescriptLibsModels(
  isShown: boolean,
  typescriptLibs: TypescriptLib[] | undefined,
  includedGlobalUtils: IncludedGlobalUtils | undefined,
  latestContentChangeProcessingPromise: RefObject<Promise<void> | null>,
) {
  useEffect(() => {
    const libs = [
      ...(typescriptLibs ?? []),
      ...getGlobalUtilsTypescriptLibs(includedGlobalUtils),
    ];
    if (isShown && typescriptLibs) {
      for (const { path, source } of libs) {
        monaco.editor.createModel(
          source,
          "typescript",
          makeTsLibModelUri(path),
        );
      }
      // WORKAROUND: It seems that for some reason monaco's TypeScript worker
      // caches old models even when they have been disposed, so when libs
      // update (for example when the code generated from a schema changes) the
      // editor sees the change (i.e., you see the code of the new version of
      // the lib), but the TypeScript worker doesn't (so you get compilation
      // errors). Making a trivial change to compiler options seems to be enough
      // to bust the cache.
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
        // Thankfully we can pass in arbitrary options, so we don't have to
        // touch a "real" option.
        cacheBuster: crypto.randomUUID(),
      });
      return () => {
        (async () => {
          await latestContentChangeProcessingPromise.current;
          for (const { path } of libs) {
            monaco.editor.getModel(makeTsLibModelUri(path))?.dispose();
          }
        })();
      };
    }
    return undefined;
  }, [
    isShown,
    typescriptLibs,
    includedGlobalUtils,
    latestContentChangeProcessingPromise,
  ]);
}

/**
 * Creates the model for the value source, and keeps it in sync with the outside
 * world.
 */
function useSyncSourceModel(
  isShown: boolean,
  value: TypescriptModule,
  onChange: (newValue: TypescriptModule) => void,
  latestContentChangeProcessingPromise: RefObject<Promise<void> | null>,
) {
  const sourceModelRef = useRef<monaco.editor.ITextModel>(null);

  useEffect(() => {
    if (!isShown) {
      return;
    }

    if (sourceModelRef.current === null) {
      const sourceModelPath = `${uriScheme}/main.ts`;
      const sourceModel = monaco.editor.createModel(
        value.source,
        "typescript",
        monaco.Uri.parse(sourceModelPath),
      );
      sourceModelRef.current = sourceModel;

      // Propagate changes to the model to the outside world. The propagation
      // includes the changes to the TypeScript source AND the compiled
      // source.
      //
      // Note 1: compilation is an asynchronous operation. This means that it's
      // possible that an earlier change whose compilation took longer than
      // expected finishes compilation AFTER a subsequent change. If the
      // earlier change were allowed to call the onChange with its older, now
      // stale value, the user would see the value of the input "revert back".
      // To avoid this race condition, we keep track of the latest change and
      // allow onChange to be called only for the latest change.
      //
      // Note 2: listening for changes is debounced, since we don't want to
      // trigger a recompilation on every keystroke.
      //
      // Note 3: we keep track of the promise returned by handleDidChangeContent
      // so that we can, on component unmount, delay model disposals until the
      // last content change has been processed.
      let latestChangeId = 0;
      const handleDidChangeContent = pDebounce(async () => {
        const changeId = latestChangeId + 1;
        latestChangeId = changeId;

        const newSource = sourceModel.getValue();
        onChange({ source: newSource, compiled: "" });
        const newCompiled = await getCompilationOutput(
          sourceModelPath,
          forms.constants.FAILED_COMPILATION_OUTPUT,
        );

        if (changeId === latestChangeId) {
          onChange({ source: newSource, compiled: newCompiled });
        }
      }, MONACO_EDITOR_ON_DID_CHANGE_CONTENT_DEBOUNCE);
      sourceModel.onDidChangeContent(() => {
        latestContentChangeProcessingPromise.current = handleDidChangeContent();
      });
      // Trigger the handler once to force recompilation on first
      // initialization.
      latestContentChangeProcessingPromise.current = handleDidChangeContent();
    } else if (sourceModelRef.current.getValue() !== value.source) {
      // Since setting the model's value resets the editor's position, the
      // value is set only when the "received" outside value differs from the
      // current model value.
      sourceModelRef.current.setValue(value.source);
    }
  }, [isShown, value, onChange, latestContentChangeProcessingPromise]);

  // Dispose the model and reset its ref whenever isShown changes.
  useEffect(() => {
    return isShown
      ? () => {
          (async () => {
            await latestContentChangeProcessingPromise.current;
            sourceModelRef.current?.dispose();
            sourceModelRef.current = null;
          })();
        }
      : undefined;
  }, [isShown, latestContentChangeProcessingPromise]);

  return { sourceModelRef };
}

/**
 * Creates the monaco editor instance when the component is shown, and disposes
 * it when the component is hidden.
 */
function useCreateEditor(
  isShown: boolean,
  sourceModelRef: RefObject<monaco.editor.ITextModel | null>,
  initialPositionRef: RefObject<monaco.IPosition | null>,
) {
  const editorElementRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);

  useEffect(() => {
    if (editorElementRef.current && isShown) {
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

      editorRef.current.setPosition(
        initialPositionRef.current ?? { lineNumber: 1, column: 1 },
      );
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
    sourceModelRef,
    initialPositionRef,
  ]);

  return { editorElementRef, editorRef };
}

/** Keeps the editor theme in sync with the app theme. */
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

///////////
// Utils //
///////////

function getContainerHeight(editorContentHeigh: number): number {
  const bordersWidth = 2;
  const paddingBlockEnd = 0;
  return editorContentHeigh + bordersWidth + paddingBlockEnd;
}

function makeTsLibModelUri(path: TypescriptLib["path"]): monaco.Uri {
  return monaco.Uri.parse(`${uriScheme}${path}`);
}

/** Gets the compiled output of the supplied source file. */
async function getCompilationOutput(
  sourcePath: `${string}.ts`,
  failedCompilationOutput: string,
): Promise<string> {
  try {
    const worker = await monaco.languages.typescript
      .getTypeScriptWorker()
      .catch((error) => {
        // Sometimes the first call to `getTypeScriptWorker` fails with the
        // error below (actually string, not an Error object). It's not clear
        // why. The second attempt seems to work, so here we retry once.
        if (error === "TypeScript not registered!") {
          return monaco.languages.typescript.getTypeScriptWorker();
        }
        throw error;
      })
      .then((getter) => getter());

    const emitOutput = await worker.getEmitOutput(sourcePath);
    const diagnostics = (
      await Promise.all([
        worker.getSyntacticDiagnostics(sourcePath),
        worker.getSemanticDiagnostics(sourcePath),
        emitOutput.diagnostics ?? [],
      ])
    ).flat();

    const compiledPath = sourcePath.replace(/\.ts$/, ".js");
    const compiled = emitOutput.outputFiles.find(
      ({ name }) => name === compiledPath,
    )?.text;

    return isEmpty(diagnostics) && compiled
      ? compiled
      : failedCompilationOutput;
  } catch (error) {
    console.error("Error compiling TypescriptModule:", error);
    return failedCompilationOutput;
  }
}
