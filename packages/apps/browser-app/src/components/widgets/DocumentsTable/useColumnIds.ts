import { useId } from "react";

export interface ColumnIds {
  propertyPrefix: string;
  createdAt: string;
  lastModifiedAt: string;
}

export default function useColumnIds(): ColumnIds {
  return {
    propertyPrefix: useId(),
    createdAt: useId(),
    lastModifiedAt: useId(),
  };
}
