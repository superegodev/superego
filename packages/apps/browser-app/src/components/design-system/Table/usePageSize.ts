import { useCallback, useEffect, useState } from "react";

const ROW_HEIGHT = 40;
const HEADING_HEIGHT = 41;

interface UsePageSizeOptions {
  pageSize: number | "max";
}

interface UsePageSize<TElement extends Element> {
  calculatedPageSize: number;
  containerRef: (element: TElement | null) => void;
}

export default function usePageSize<TElement extends Element>({
  pageSize,
}: UsePageSizeOptions): UsePageSize<TElement> {
  const [element, setElement] = useState<TElement | null>(null);
  const [calculatedPageSize, setCalculatedPageSize] = useState(() =>
    pageSize === "max" ? 0 : pageSize,
  );

  const containerRef = useCallback((node: TElement | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (pageSize !== "max") {
      setCalculatedPageSize(pageSize);
      return;
    }

    if (!element) {
      return;
    }

    const calculatePageSize = () => {
      const availableHeight = element.getBoundingClientRect().height;
      const rowsHeight = availableHeight - HEADING_HEIGHT;
      const newPageSize = Math.max(1, Math.floor(rowsHeight / ROW_HEIGHT));
      setCalculatedPageSize(newPageSize);
    };

    calculatePageSize();

    const resizeObserver = new ResizeObserver(calculatePageSize);
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [pageSize, element]);

  return { calculatedPageSize, containerRef };
}
