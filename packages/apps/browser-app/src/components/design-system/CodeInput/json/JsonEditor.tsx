import type { Property } from "csstype";
import type { FocusEvent, RefObject } from "react";
import type monaco from "../../../../monaco.js";
import useCreateEditor from "../common-hooks/useCreateEditor.js";
import useEditorBasePath from "../common-hooks/useEditorBasePath.js";
import useSyncCodeModel from "../common-hooks/useSyncCodeModel.js";
import useSyncEditorTheme from "../common-hooks/useSyncEditorTheme.js";

interface Props {
  isShown: boolean;
  value: string;
  onChange: (newValue: string) => void;
  codeFileName?: `${string}.json`;
  initialPositionRef: RefObject<monaco.IPosition | null>;
  initialScrollPositionRef: RefObject<monaco.editor.INewScrollPosition | null>;
  maxHeight: Property.MaxHeight | undefined;
}
export default function JsonEditor({
  isShown,
  value,
  onChange,
  codeFileName,
  initialPositionRef,
  initialScrollPositionRef,
  maxHeight,
}: Props) {
  const editorBasePath = useEditorBasePath(isShown);

  const { codeModelRef } = useSyncCodeModel(editorBasePath, isShown, {
    language: "json",
    value: value,
    fileName: codeFileName,
  });

  const { editorElementRef, editorRef } = useCreateEditor(
    isShown,
    codeModelRef,
    initialPositionRef,
    initialScrollPositionRef,
  );

  useSyncEditorTheme(editorRef);

  // On blur, propagate changes to the model to the outside world.
  const onBlur = async (evt: FocusEvent<HTMLDivElement, Element>) => {
    if (
      editorElementRef.current?.contains(evt.relatedTarget) ||
      !codeModelRef.current
    ) {
      return;
    }
    onChange(codeModelRef.current.getValue());
  };

  return (
    <div
      style={{ display: !isShown ? "none" : undefined, maxHeight }}
      ref={editorElementRef}
      onBlur={onBlur}
    />
  );
}
