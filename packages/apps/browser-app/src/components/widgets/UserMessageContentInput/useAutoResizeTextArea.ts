import { type RefObject, useEffect } from "react";

export default function useAutoResizeTextArea(
  textAreaRef: RefObject<HTMLTextAreaElement | null>,
  content: string,
) {
  // We want to resize the textarea on content change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.overflowY = "hidden";
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
      textAreaRef.current.style.overflow = "auto";
    }
  }, [textAreaRef, content]);
}
