import type { TypescriptFile, TypescriptModule } from "@superego/backend";
import type { Property } from "csstype";
import { useCallback, useMemo, useRef } from "react";
import type monaco from "../../../../monaco.js";
import useEditor from "../common-hooks/useEditor.js";
import useEditorBasePath from "../common-hooks/useEditorBasePath.js";
import type UndoRedo from "../UndoRedo.js";
import ImplementWithAssistantButton from "./ImplementWithAssistantButton.js";
import type IncludedGlobalUtils from "./IncludedGlobalUtils.js";
import { getGlobalUtilsTypescriptLibs } from "./IncludedGlobalUtils.js";
import useSyncTypescriptLibsModels from "./useSyncTypescriptLibsModels.js";

interface Props {
  language: "typescript" | "typescript-jsx";
  value: TypescriptModule;
  onChange: (newValue: TypescriptModule) => void;
  undoRedo?: UndoRedo | undefined;
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
  isReadOnly?: boolean | undefined;
}
export default function TypescriptEditor({
  language,
  value,
  onChange,
  undoRedo,
  ariaLabel,
  typescriptLibs,
  includedGlobalUtils,
  filePath = language === "typescript" ? "/main.ts" : "/main.tsx",
  maxHeight,
  assistantImplementation,
  isReadOnly,
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

  const compileSource = useCallback(
    async (source: string) => {
      onChange(source);
    },
    [onChange],
  );

  const { editorElementRef } = useEditor(
    editorBasePath,
    // For the monaco editor, both "typescript" and "typescript-jsx" can be
    // handled with the "typescript" language. We use the differentiation
    // externally to be able to set the correct filePath (.ts or .tsx).
    "typescript",
    value,
    compileSource,
    undoRedo,
    valueModelRef,
    ariaLabel,
    filePath,
    isReadOnly,
  );

  return (
    <>
      <div style={{ maxHeight }} ref={editorElementRef} />
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
