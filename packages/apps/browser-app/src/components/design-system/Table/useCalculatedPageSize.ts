import { useCallback, useEffect, useState } from "react";

const HEADING_HEIGHT = 41;
const ROW_HEIGHT = 40;

interface UseCalculatedPageSizeOptions {
  pageSize: number | "max";
}

interface UseCalculatedPageSize {
  calculatedPageSize: number;
  tableContainerRef: (tableContainer: HTMLDivElement | null) => void;
}

export default function useCalculatedPageSize({
  pageSize,
}: UseCalculatedPageSizeOptions): UseCalculatedPageSize {
  const [tableContainer, setTableContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const [calculatedPageSize, setCalculatedPageSize] = useState(() =>
    pageSize === "max" ? 0 : pageSize,
  );

  const tableContainerRef = useCallback((node: HTMLDivElement | null) => {
    setTableContainer(node);
  }, []);

  useEffect(() => {
    if (pageSize !== "max") {
      setCalculatedPageSize(pageSize);
      return;
    }

    if (!tableContainer) {
      return;
    }

    const calculatePageSize = () => {
      const availableHeight = tableContainer.getBoundingClientRect().height;
      const rowsHeight = availableHeight - HEADING_HEIGHT;
      const newPageSize = Math.max(1, Math.floor(rowsHeight / ROW_HEIGHT));
      setCalculatedPageSize(newPageSize);
    };

    calculatePageSize();

    const resizeObserver = new ResizeObserver(calculatePageSize);
    resizeObserver.observe(tableContainer);
    return () => resizeObserver.disconnect();
  }, [pageSize, tableContainer]);

  return { calculatedPageSize, tableContainerRef };
}
