import { useEffect, useState } from "react";
import useCalculatedPageSize from "./useCalculatedPageSize.js";

interface UseTablePaginationOptions<Item> {
  items: Item[];
  pageSize: number | "max";
  paginationThreshold: number;
}

interface UseTablePagination<Item> {
  isPaginating: boolean;
  activePage: number;
  setActivePage: (activePage: number) => void;
  calculatedPageSize: number;
  totalPages: number;
  tableContainerRef: (tableContainer: HTMLDivElement | null) => void;
  displayedItems: Item[];
}

export default function useTablePagination<Item>({
  items,
  pageSize,
  paginationThreshold,
}: UseTablePaginationOptions<Item>): UseTablePagination<Item> {
  const [activePage, setActivePage] = useState(1);

  const isPaginating = items.length > paginationThreshold;

  const { calculatedPageSize, tableContainerRef } = useCalculatedPageSize({
    pageSize: isPaginating ? pageSize : items.length,
  });

  // Reset activePage when items changes, since it causes displayedItems to
  // change and renders the active page mostly meaningless to the user.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    setActivePage(1);
  }, [items]);

  const totalPages = isPaginating
    ? calculatedPageSize === 0
      ? 0
      : Math.ceil(items.length / calculatedPageSize)
    : 1;

  const startIndex = (activePage - 1) * calculatedPageSize;
  const displayedItems = isPaginating
    ? items.slice(startIndex, startIndex + calculatedPageSize)
    : items;

  return {
    isPaginating,
    activePage,
    setActivePage,
    calculatedPageSize,
    totalPages,
    tableContainerRef,
    displayedItems,
  };
}
