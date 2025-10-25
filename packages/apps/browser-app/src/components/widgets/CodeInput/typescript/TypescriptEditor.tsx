import type { TypescriptFile, TypescriptModule } from "@superego/backend";
import type { Property } from "csstype";
import pTimeout from "p-timeout";
import { useCallback, useEffect, useMemo, useRef } from "react";
import forms from "../../../../business-logic/forms/forms.js";
import { MONACO_EDITOR_COMPILATION_TIMEOUT } from "../../../../config.js";
import type monaco from "../../../../monaco.js";
import useEditor from "../common-hooks/useEditor.js";
import useEditorBasePath from "../common-hooks/useEditorBasePath.js";
import CompilationInProgressIndicator from "./CompilationInProgressIndicator.js";
import getCompilationOutput from "./getCompilationOutput.js";
import ImplementWithAssistantButton from "./ImplementWithAssistantButton.js";
import type IncludedGlobalUtils from "./IncludedGlobalUtils.js";
import { getGlobalUtilsTypescriptLibs } from "./IncludedGlobalUtils.js";
import useSyncTypescriptLibsModels from "./useSyncTypescriptLibsModels.js";

interface Props {
  language: "typescript" | "typescript-jsx";
  value: TypescriptModule;
  onChange: (newValue: TypescriptModule) => void;
  ariaLabel?: string | undefined;
  typescriptLibs: TypescriptFile[] | undefined;
  includedGlobalUtils: IncludedGlobalUtils | undefined;
  filePath?: `/${string}.ts` | `/${string}.tsx`;
  maxHeight: Property.MaxHeight | undefined;
  assistantImplementation?:
    | {
        description: string;
        rules?: string | undefined;
        additionalInstructions?: string | undefined;
        template: string;
        userRequest: string;
      }
    | undefined;
}
export default function TypescriptEditor({
  language,
  value,
  onChange,
  ariaLabel,
  typescriptLibs,
  includedGlobalUtils,
  filePath = language === "typescript" ? "/main.ts" : "/main.tsx",
  maxHeight,
  assistantImplementation,
}: Props) {
  const editorBasePath = useEditorBasePath();

  const allTypescriptLibs = useMemo(
    () => [
      ...(typescriptLibs ?? []),
      ...getGlobalUtilsTypescriptLibs(includedGlobalUtils),
    ],
    [typescriptLibs, includedGlobalUtils],
  );

  useSyncTypescriptLibsModels(editorBasePath, allTypescriptLibs);

  const valueModelRef = useRef<monaco.editor.ITextModel>(null);

  // Note: compilation is an asynchronous operation. This means that it's
  // possible that an earlier change whose compilation took longer than expected
  // finishes compilation AFTER a subsequent change. If the earlier change were
  // allowed to call the onChange with its older, now stale value, the user
  // would see the value of the input "revert back". To avoid this race
  // condition, we keep track of the latest change and allow onChange to be
  // called only for the latest change.
  const latestChangeIdRef = useRef(0);
  const compileSource = useCallback(
    async (source: string) => {
      if (!valueModelRef.current) {
        return;
      }

      const changeId = latestChangeIdRef.current + 1;
      latestChangeIdRef.current = changeId;

      onChange({
        source: source,
        // EVOLUTION: move compilation to the backend, which should simplify the
        // logic here quite a lot. For now, let's live with this ugly hack to keep
        // track of the compilation state.
        compiled: forms.constants.COMPILATION_IN_PROGRESS,
      });
      const newCompiled = await pTimeout(
        getCompilationOutput(
          valueModelRef.current.uri.toString(),
          forms.constants.COMPILATION_FAILED,
        ),
        {
          milliseconds: MONACO_EDITOR_COMPILATION_TIMEOUT,
          fallback: () => forms.constants.COMPILATION_FAILED,
        },
      );

      if (changeId === latestChangeIdRef.current) {
        onChange({ source: source, compiled: newCompiled });
      }
    },
    [onChange],
  );

  const { editorElementRef } = useEditor(
    editorBasePath,
    // For the monaco editor, both "typescript" and "typescript-jsx" can be
    // handled with the "typescript" language. We use the differentiation
    // externally to be able to set the correct filePath (.ts or .tsx).
    "typescript",
    value.source,
    compileSource,
    valueModelRef,
    ariaLabel,
    filePath,
  );

  // Recompile on mount if compilation is required.
  useEffect(() => {
    if (value.compiled === forms.constants.COMPILATION_REQUIRED) {
      compileSource(value.source);
    }
  }, [value.compiled, value.source, compileSource]);

  return (
    <>
      <div style={{ maxHeight }} ref={editorElementRef} />
      <CompilationInProgressIndicator
        isVisible={value.compiled === forms.constants.COMPILATION_IN_PROGRESS}
      />
      <ImplementWithAssistantButton
        filePath={filePath}
        assistantImplementation={assistantImplementation}
        typescriptLibs={allTypescriptLibs}
        valueModelRef={valueModelRef}
        onImplemented={onChange}
      />
    </>
  );
}
