import type { TypescriptModule } from "@superego/backend";
import type { Property } from "csstype";
import pTimeout from "p-timeout";
import { type FocusEvent, useRef } from "react";
import forms from "../../../../business-logic/forms/forms.js";
import { MONACO_EDITOR_COMPILATION_TIMEOUT } from "../../../../config.js";
import useEditor from "../common-hooks/useEditor.js";
import useEditorBasePath from "../common-hooks/useEditorBasePath.js";
import getCompilationOutput from "./getCompilationOutput.js";
import type IncludedGlobalUtils from "./IncludedGlobalUtils.js";
import type TypescriptLib from "./TypescriptLib.js";
import useSyncTypescriptLibsModels from "./useSyncTypescriptLibsModels.js";

interface Props {
  value: TypescriptModule;
  onChange: (newValue: TypescriptModule) => void;
  typescriptLibs: TypescriptLib[] | undefined;
  includedGlobalUtils: IncludedGlobalUtils | undefined;
  fileName?: `${string}.ts`;
  maxHeight: Property.MaxHeight | undefined;
}
export default function TypescriptEditor({
  value,
  onChange,
  typescriptLibs,
  includedGlobalUtils,
  fileName,
  maxHeight,
}: Props) {
  const editorBasePath = useEditorBasePath();

  useSyncTypescriptLibsModels(
    editorBasePath,
    typescriptLibs,
    includedGlobalUtils,
  );

  const { editorElementRef, sourceModelRef } = useEditor(
    editorBasePath,
    "typescript",
    value.source,
    fileName,
  );

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
      // EVOLUTION: move compilation to the backend, which should simplify the
      // logic here quite a lot. For now, let's live with this ugly hack to keep
      // track of the compilation state.
      compiled: forms.constants.COMPILATION_IN_PROGRESS,
    });
    const newCompiled = await pTimeout(
      getCompilationOutput(
        sourceModelRef.current.uri.toString(),
        forms.constants.COMPILATION_FAILED,
      ),
      {
        milliseconds: MONACO_EDITOR_COMPILATION_TIMEOUT,
        fallback: () => forms.constants.COMPILATION_FAILED,
      },
    );

    if (blurId === latestBlurIdRef.current) {
      onChange({ source: newSource, compiled: newCompiled });
    }
  };

  return <div style={{ maxHeight }} ref={editorElementRef} onBlur={onBlur} />;
}
