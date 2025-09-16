import type { TypescriptModule } from "@superego/backend";
import type { Property } from "csstype";
import pTimeout from "p-timeout";
import { type FocusEvent, type RefObject, useRef } from "react";
import forms from "../../../../business-logic/forms/forms.js";
import { MONACO_EDITOR_COMPILATION_TIMEOUT } from "../../../../config.js";
import type monaco from "../../../../monaco.js";
import useCreateEditor from "../common-hooks/useCreateEditor.js";
import useEditorBasePath from "../common-hooks/useEditorBasePath.js";
import useSyncCodeModel from "../common-hooks/useSyncCodeModel.js";
import useSyncEditorTheme from "../common-hooks/useSyncEditorTheme.js";
import getCompilationOutput from "./getCompilationOutput.js";
import type IncludedGlobalUtils from "./IncludedGlobalUtils.js";
import type TypescriptLib from "./TypescriptLib.js";
import useSyncTypescriptLibsModels from "./useSyncTypescriptLibsModels.js";

interface Props {
  isShown: boolean;
  value: TypescriptModule;
  onChange: (newValue: TypescriptModule) => void;
  typescriptLibs: TypescriptLib[] | undefined;
  includedGlobalUtils: IncludedGlobalUtils | undefined;
  codeFileName?: `${string}.ts`;
  initialPositionRef: RefObject<monaco.IPosition | null>;
  initialScrollPositionRef: RefObject<monaco.editor.INewScrollPosition | null>;
  maxHeight: Property.MaxHeight | undefined;
}
export default function TypescriptEditor({
  isShown,
  value,
  onChange,
  typescriptLibs,
  includedGlobalUtils,
  codeFileName,
  initialPositionRef,
  initialScrollPositionRef,
  maxHeight,
}: Props) {
  const editorBasePath = useEditorBasePath(isShown);

  // We keep track of compilation promises, so that we can, on component
  // unmount, delay model disposals until the last content compilation has
  // completed.
  const latestCompilationPromiseRef = useRef<Promise<string> | null>(null);

  useSyncTypescriptLibsModels(
    editorBasePath,
    isShown,
    typescriptLibs,
    includedGlobalUtils,
    latestCompilationPromiseRef,
  );

  const { codeModelRef } = useSyncCodeModel(
    editorBasePath,
    isShown,
    { language: "typescript", value, fileName: codeFileName },
    latestCompilationPromiseRef,
  );

  const { editorElementRef, editorRef } = useCreateEditor(
    isShown,
    codeModelRef,
    initialPositionRef,
    initialScrollPositionRef,
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
      !codeModelRef.current
    ) {
      return;
    }

    const blurId = latestBlurIdRef.current + 1;
    latestBlurIdRef.current = blurId;

    const newSource = codeModelRef.current.getValue();
    onChange({
      source: newSource,
      // TODO: move compilation to the backend, which should simplify the logic
      // here quite a lot. For now, let's live with this ugly hack to keep track
      // of the compilation state.
      compiled: forms.constants.COMPILATION_IN_PROGRESS,
    });
    latestCompilationPromiseRef.current = pTimeout(
      getCompilationOutput(
        codeModelRef.current.uri.toString(),
        forms.constants.COMPILATION_FAILED,
      ),
      {
        milliseconds: MONACO_EDITOR_COMPILATION_TIMEOUT,
        fallback: () => forms.constants.COMPILATION_FAILED,
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
