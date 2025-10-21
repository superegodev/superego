import type { Property } from "csstype";
import { useRef } from "react";
import type monaco from "../../../../monaco.js";
import useEditor from "../common-hooks/useEditor.js";
import useEditorBasePath from "../common-hooks/useEditorBasePath.js";

interface Props {
  value: string;
  onChange: (newValue: string) => void;
  ariaLabel?: string | undefined;
  fileName?: `${string}.json`;
  maxHeight: Property.MaxHeight | undefined;
}
export default function JsonEditor({
  value,
  onChange,
  ariaLabel,
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
    ariaLabel,
    fileName,
  );
  return <div style={{ maxHeight }} ref={editorElementRef} />;
}
