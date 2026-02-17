import { type RefObject, useEffect } from "react";

// On browsers that support field-sizing (all major browsers except Firefox),
// auto-resizing is handled by the CSS `field-sizing: content` property, so this
// hook becomes a no-op. On Firefox, we fall back to the JS-based resize.
const supportsFieldSizing =
  typeof CSS !== "undefined" && CSS.supports("field-sizing", "content");

export default function useAutoResizeTextArea(
  textAreaRef: RefObject<HTMLTextAreaElement | null>,
  content: string,
) {
  // We want to resize the textarea on content change.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    if (supportsFieldSizing) return;
    if (textAreaRef.current) {
      textAreaRef.current.style.overflowY = "hidden";
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
      textAreaRef.current.style.overflow = "auto";
    }
  }, [textAreaRef, content]);
}
