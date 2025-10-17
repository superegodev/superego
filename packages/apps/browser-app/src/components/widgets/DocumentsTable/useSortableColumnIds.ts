import { useId } from "react";

export interface SortableColumnIds {
  propertyPrefix: string;
  createdAt: string;
  lastModifiedAt: string;
}

export default function useSortableColumnIds(): SortableColumnIds {
  return {
    propertyPrefix: useId(),
    createdAt: useId(),
    lastModifiedAt: useId(),
  };
}
