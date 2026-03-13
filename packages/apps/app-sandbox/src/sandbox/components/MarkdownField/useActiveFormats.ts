import { getActiveFormats } from "markdown-actions";
import type { OverTypeInstance } from "overtype";
import { type RefObject, useEffect, useState } from "react";

export default function useActiveFormats(
  editorRef: RefObject<OverTypeInstance | null>,
): Set<string> {
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  useEffect(() => {
    const textarea = editorRef.current?.textarea;
    if (!textarea) {
      return;
    }

    const update = () => {
      setActiveFormats(new Set(getActiveFormats(textarea)));
    };

    textarea.addEventListener("selectionchange", update);
    textarea.addEventListener("input", update);

    return () => {
      textarea.removeEventListener("selectionchange", update);
      textarea.removeEventListener("input", update);
    };
  });

  return activeFormats;
}
