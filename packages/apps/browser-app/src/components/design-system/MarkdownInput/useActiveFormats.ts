import { getActiveFormats } from "markdown-actions";
import type { OverTypeInstance } from "overtype";
import { type RefObject, useEffect, useState } from "react";

export default function useActiveFormats(
  editorRef: RefObject<OverTypeInstance | null>,
): Set<string> {
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [textarea, setTextarea] = useState<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const current = editorRef.current?.textarea ?? null;
    if (current !== textarea) {
      setTextarea(current);
    }
  });

  useEffect(() => {
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
  }, [textarea]);

  return activeFormats;
}
