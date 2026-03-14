import { type RefObject, useEffect, useRef, useState } from "react";

interface UseElementHeight<TElement extends Element> {
  height: number;
  ref: RefObject<TElement | null>;
}
export default function useElementHeight<
  TElement extends Element,
>(): UseElementHeight<TElement> {
  const [height, setHeight] = useState(0);
  const ref = useRef<TElement>(null);
  useEffect(() => {
    if (ref.current) {
      const element = ref.current;
      const resizeObserver = new ResizeObserver(() =>
        setHeight(element.getBoundingClientRect().height),
      );
      resizeObserver.observe(element);
      return () => resizeObserver.disconnect();
    }
    return;
  }, []);
  return { height, ref };
}
