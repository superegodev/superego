import type { Property } from "csstype";
import { useRef } from "react";
import type monaco from "../../../../monaco.js";
import useEditor from "../common-hooks/useEditor.js";
import useEditorBasePath from "../common-hooks/useEditorBasePath.js";
import type UndoRedo from "../UndoRedo.js";

interface Props {
  value: string;
  onChange: (newValue: string) => void;
  undoRedo?: UndoRedo | undefined;
  ariaLabel?: string | undefined;
  filePath?: `/${string}.json`;
  maxHeight: Property.MaxHeight | undefined;
  isReadOnly?: boolean | undefined;
}
export default function JsonEditor({
  value,
  onChange,
  undoRedo,
  ariaLabel,
  filePath = "/main.json",
  maxHeight,
  isReadOnly,
}: Props) {
  const editorBasePath = useEditorBasePath();
  const valueModelRef = useRef<monaco.editor.ITextModel>(null);
  const { editorElementRef } = useEditor(
    editorBasePath,
    "json",
    value,
    onChange,
    undoRedo,
    valueModelRef,
    ariaLabel,
    filePath,
    isReadOnly,
  );
  return <div style={{ maxHeight }} ref={editorElementRef} />;
}
