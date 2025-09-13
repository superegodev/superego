import { Theme, type TypescriptModule } from "@superego/backend";
import type { Property } from "csstype";
import pTimeout from "p-timeout";
import {
  type FocusEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
} from "react";
import forms from "../../../business-logic/forms/forms.js";
import useTheme from "../../../business-logic/theme/useTheme.js";
import { MONACO_EDITOR_COMPILATION_TIMEOUT } from "../../../config.js";
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
  // We use editorId as base path under which we create models. This sort-of
  // allows multiple instances of the editor to exist at the same time, though
  // they still share the same virtual filesystem. But we don't usually expect
  // many instances to exist at the same time, as each instance is disposed
  // onBlur. This is not done immediately, though. The instance is disposed only
  // after its last compilation completed. So, if in the meantime another
  // instance has been created, there is a brief period in which two instances
  // coexist. Hence why we want the id to change every time isShown changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  const editorId = useMemo(() => crypto.randomUUID(), [isShown]);

  // We keep track of compilation promises, so that we can, on component
  // unmount, delay model disposals until the last content compilation has
  // completed.
  const latestCompilationPromiseRef = useRef<Promise<string> | null>(null);

  useSyncTypescriptLibsModels(
    editorId,
    isShown,
    typescriptLibs,
    includedGlobalUtils,
    latestCompilationPromiseRef,
  );

  const { sourceModelRef } = useSyncSourceModel(
    editorId,
    isShown,
    value,
    latestCompilationPromiseRef,
  );

  const { editorElementRef, editorRef } = useCreateEditor(
    isShown,
    sourceModelRef,
    initialPositionRef,
  );

  useSyncEditorTheme(editorRef);

  // On blur, propagate changes to the model to the outside world. The
  // propagation includes the changes to the TypeScript source AND the compiled
  // source.
  //
  // Note: compilation is an asynchronous operation. This means that it's
  // possible that an earlier change whose compilation took longer than expected
  // finishes compilation AFTER a subsequent change. If the earlier change were
  // allowed to call the onChange with its older, now stale value, the user
  // would see the value of the input "revert back". To avoid this race
  // condition, we keep track of the latest change and allow onChange to be
  // called only for the latest change.
  const latestBlurIdRef = useRef(0);
  const onBlur = async (evt: FocusEvent<HTMLDivElement, Element>) => {
    if (
      editorElementRef.current?.contains(evt.relatedTarget) ||
      !sourceModelRef.current
    ) {
      return;
    }

    const blurId = latestBlurIdRef.current + 1;
    latestBlurIdRef.current = blurId;

    const newSource = sourceModelRef.current.getValue();
    onChange({
      source: newSource,
      // TODO: move compilation to the backend, which should simplify the logic
      // here quite a lot. For now, let's live with this ugly hack to keep track
      // of the compilation state.
      compiled: forms.constants.IN_PROGRESS_COMPILATION_OUTPUT,
    });
    latestCompilationPromiseRef.current = pTimeout(
      getCompilationOutput(
        sourceModelRef.current.uri.toString(),
        forms.constants.FAILED_COMPILATION_OUTPUT,
      ),
      {
        milliseconds: MONACO_EDITOR_COMPILATION_TIMEOUT,
        fallback: () => forms.constants.FAILED_COMPILATION_OUTPUT,
      },
    );
    const newCompiled = await latestCompilationPromiseRef.current;

    if (blurId === latestBlurIdRef.current) {
      onChange({ source: newSource, compiled: newCompiled });
    }
  };

  return (
    <div
      style={{ display: !isShown ? "none" : undefined, maxHeight }}
      ref={editorElementRef}
      onBlur={onBlur}
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
  editorId: string,
  isShown: boolean,
  typescriptLibs: TypescriptLib[] | undefined,
  includedGlobalUtils: IncludedGlobalUtils | undefined,
  latestCompilationPromiseRef: RefObject<Promise<string> | null>,
) {
  useEffect(() => {
    if (isShown && typescriptLibs) {
      const libModels = [
        ...(typescriptLibs ?? []),
        ...getGlobalUtilsTypescriptLibs(includedGlobalUtils),
      ].map(({ path, source }) =>
        monaco.editor.createModel(
          source,
          "typescript",
          makeTsLibModelUri(`/${editorId}${path}`),
        ),
      );
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
          await latestCompilationPromiseRef.current;
          for (const libModel of libModels) {
            libModel.dispose();
          }
        })();
      };
    }
    return undefined;
  }, [
    isShown,
    typescriptLibs,
    includedGlobalUtils,
    latestCompilationPromiseRef,
    editorId,
  ]);
}

/**
 * Creates the model for the value source, and keeps it in sync with the outside
 * world.
 */
function useSyncSourceModel(
  editorId: string,
  isShown: boolean,
  value: TypescriptModule,
  latestCompilationPromiseRef: RefObject<Promise<string> | null>,
) {
  const sourceModelRef = useRef<monaco.editor.ITextModel>(null);

  useEffect(() => {
    if (!isShown) {
      return;
    }

    if (sourceModelRef.current === null) {
      const sourceModelPath =
        `${uriScheme}/${editorId}/main.ts` as `${string}.ts`;
      const sourceModel = monaco.editor.createModel(
        value.source,
        "typescript",
        monaco.Uri.parse(sourceModelPath),
      );
      sourceModelRef.current = sourceModel;
    } else if (sourceModelRef.current.getValue() !== value.source) {
      // Since setting the model's value resets the editor's position, the
      // value is set only when the "received" outside value differs from the
      // current model value.
      sourceModelRef.current.setValue(value.source);
    }
  }, [isShown, value, editorId]);

  // Dispose the model and reset its ref whenever isShown changes.
  useEffect(() => {
    return isShown
      ? () => {
          (async () => {
            await latestCompilationPromiseRef.current;
            sourceModelRef.current?.dispose();
            sourceModelRef.current = null;
          })();
        }
      : undefined;
  }, [isShown, latestCompilationPromiseRef]);

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
  sourcePath: string,
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
