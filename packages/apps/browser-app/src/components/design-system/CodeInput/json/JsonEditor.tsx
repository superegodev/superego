import type { Property } from "csstype";
import type { FocusEvent } from "react";
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

  const { editorElementRef, sourceModelRef } = useEditor(
    editorBasePath,
    "json",
    value,
    fileName,
  );

  // On blur, propagate changes to the model to the outside world.
  const onBlur = async (evt: FocusEvent<HTMLDivElement, Element>) => {
    if (
      editorElementRef.current?.contains(evt.relatedTarget) ||
      !sourceModelRef.current
    ) {
      return;
    }
    onChange(sourceModelRef.current.getValue());
  };

  return <div style={{ maxHeight }} ref={editorElementRef} onBlur={onBlur} />;
}
