import type { Property } from "csstype";
import { useRef } from "react";
import type monaco from "../../../../monaco.js";
import useEditor from "../common-hooks/useEditor.js";
import useEditorBasePath from "../common-hooks/useEditorBasePath.js";

interface Props {
  value: string;
  onChange: (newValue: string) => void;
  fileName?: `${string}.json`;
  maxHeight: Property.MaxHeight | undefined;
}
export default function JsonEditor({
  value,
  onChange,
  fileName,
  maxHeight,
}: Props) {
  const editorBasePath = useEditorBasePath();
  const valueModelRef = useRef<monaco.editor.ITextModel>(null);
  const { editorElementRef } = useEditor(
    editorBasePath,
    "json",
    value,
    onChange,
    valueModelRef,
    fileName,
  );
  return <div style={{ maxHeight }} ref={editorElementRef} />;
}
