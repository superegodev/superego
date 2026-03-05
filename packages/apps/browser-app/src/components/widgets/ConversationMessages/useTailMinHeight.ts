import { useCallback, useEffect, useRef, useState } from "react";

interface UseTailMinHeight {
  tailMinHeight: number;
  lastUserMessageRef: (element: HTMLDivElement | null) => void;
  tailRef: (element: HTMLDivElement | null) => void;
}

export default function useTailMinHeight(
  deps: readonly unknown[],
): UseTailMinHeight {
  const [tailMinHeight, setTailMinHeight] = useState(0);
  const lastUserMessageElementRef = useRef<HTMLDivElement | null>(null);
  const tailElementRef = useRef<HTMLDivElement | null>(null);

  const recalculate = useCallback(() => {
    const lastUserMessageElement = lastUserMessageElementRef.current;
    const tailElement = tailElementRef.current;
    if (!lastUserMessageElement || !tailElement) {
      setTailMinHeight(0);
      return;
    }

    const panel = document.querySelector<HTMLElement>('[data-slot="Main"]');
    const header = panel?.querySelector<HTMLElement>("header");

    if (!panel || !header) {
      setTailMinHeight(0);
      return;
    }

    const headerHeight = header.getBoundingClientRect().height;
    const panelClientHeight = panel.clientHeight;
    const panelScrollHeight = panel.scrollHeight;
    const panelScrollTop = panel.scrollTop;
    const panelTop = panel.getBoundingClientRect().top;
    const userMsgTop = lastUserMessageElement.getBoundingClientRect().top;
    const currentTailHeight = tailElement.getBoundingClientRect().height;

    const userMessagePositionInScrollContent =
      userMsgTop - panelTop + panelScrollTop;

    // For the user message to appear right below the header when scrolled to
    // the bottom, the scroll height must satisfy:
    //   scrollHeight - clientHeight + headerHeight = userMessagePosition
    const desiredScrollHeight =
      userMessagePositionInScrollContent + panelClientHeight - headerHeight;

    // A 1rem adjustment is needed to account for margins.
    const adjustment = -16;

    const deficit = desiredScrollHeight - panelScrollHeight;
    setTailMinHeight(Math.max(0, currentTailHeight + deficit + adjustment));
  }, []);

  const lastUserMessageRef = useCallback(
    (element: HTMLDivElement | null) => {
      lastUserMessageElementRef.current = element;
      recalculate();
    },
    [recalculate],
  );

  const tailRef = useCallback(
    (element: HTMLDivElement | null) => {
      tailElementRef.current = element;
      recalculate();
    },
    [recalculate],
  );

  useEffect(() => {
    recalculate();
  }, [recalculate, ...deps]);

  useEffect(() => {
    window.addEventListener("resize", recalculate);
    return () => window.removeEventListener("resize", recalculate);
  }, [recalculate]);

  return { tailMinHeight, lastUserMessageRef, tailRef };
}
