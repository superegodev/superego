import { useId, useMemo } from "react";

export interface SortableColumnIds {
  propertyPrefix: string;
  createdAt: string;
  lastModifiedAt: string;
}

export default function useSortableColumnIds(): SortableColumnIds {
  const propertyPrefix = useId();
  const createdAt = useId();
  const lastModifiedAt = useId();
  return useMemo(
    () => ({ propertyPrefix, createdAt, lastModifiedAt }),
    [propertyPrefix, createdAt, lastModifiedAt],
  );
}
