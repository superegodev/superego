import { type ReactNode, useEffect, useRef } from "react";

interface Props {
  text: string | null;
  onEffectFinished?: () => void;
}
/**
 * Reveals text word-by-word with a typing effect, manipulating the DOM directly
 * via a ref to avoid React re-renders during the animation.
 */
export default function TypingText({
  text,
  onEffectFinished,
}: Props): ReactNode {
  const spanRef = useRef<HTMLSpanElement>(null);
  const displayedLengthRef = useRef(0);

  useEffect(() => {
    const span = spanRef.current;
    if (text === null || !span) {
      displayedLengthRef.current = 0;
      return;
    }

    // Reset if the new text doesn't extend what's already displayed (i.e. it's
    // a completely different string, not just the previous text growing).
    if (!text.startsWith(span.textContent ?? "")) {
      displayedLengthRef.current = 0;
    }

    const targetLength = text.length;
    let rafId = 0;
    let waitFrames = 0;

    // Each tick reveals one word, then pauses for 1-5 frames (randomized to
    // feel more natural) before revealing the next.
    const tick = () => {
      if (waitFrames > 0) {
        waitFrames--;
      } else {
        const nextSpace = text.indexOf(" ", displayedLengthRef.current);
        displayedLengthRef.current =
          nextSpace === -1 ? targetLength : nextSpace + 1;
        span.textContent = text.slice(0, displayedLengthRef.current);
        waitFrames = 1 + Math.floor(Math.random() * 2);
      }
      // If the container is clipping overflow, the remaining text is invisible.
      // Skip ahead and finish immediately.
      const container = span.parentElement;
      if (container && container.scrollHeight > container.clientHeight) {
        displayedLengthRef.current = targetLength;
        span.textContent = text;
        onEffectFinished?.();
        return;
      }

      if (displayedLengthRef.current < targetLength) {
        rafId = requestAnimationFrame(tick);
      } else {
        onEffectFinished?.();
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [text, onEffectFinished]);

  return text !== null ? <span ref={spanRef} /> : null;
}
