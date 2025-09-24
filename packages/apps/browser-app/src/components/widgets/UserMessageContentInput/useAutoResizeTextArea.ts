import { type RefObject, useEffect } from "react";

export default function useAutoResizeTextArea(
  ref: RefObject<HTMLTextAreaElement | null>,
) {
  useEffect(() => {
    if (ref.current) {
      const resize = () => {
        if (ref?.current) {
          ref.current.style.overflowY = "hidden";
          ref.current.style.height = "auto";
          const lineCount = Math.round(ref.current.scrollHeight / 16.5);
          ref.current.style.height = `${lineCount * 16.5}px`;
          ref.current.style.overflowY = "scroll";
        }
      };
      ref.current.addEventListener("input", resize);
      return () => {
        ref.current?.removeEventListener("input", resize);
      };
    }
    return undefined;
  }, [ref]);
}
