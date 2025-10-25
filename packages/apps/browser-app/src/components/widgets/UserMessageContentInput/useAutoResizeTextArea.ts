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
      const lineCount = Math.round(textAreaRef.current.scrollHeight / 16.5);
      textAreaRef.current.style.height = `${lineCount * 16.5}px`;
      textAreaRef.current.style.overflowY = "scroll";
    }
  }, [textAreaRef, content]);
}
