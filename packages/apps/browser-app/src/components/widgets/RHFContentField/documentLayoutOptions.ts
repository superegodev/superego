import type {
  DefaultDocumentLayoutOptions,
  FieldUiOptions,
} from "@superego/backend";
import { createContext, useContext } from "react";

const DocumentLayoutOptionsContext =
  createContext<DefaultDocumentLayoutOptions | null>(null);

export const DocumentLayoutOptionsProvider =
  DocumentLayoutOptionsContext.Provider;

export function useDocumentLayoutOptions(): DefaultDocumentLayoutOptions | null {
  return useContext(DocumentLayoutOptionsContext);
}

export function useFieldUiOptions(
  fieldPath: string,
): FieldUiOptions | undefined {
  const layoutOptions = useContext(DocumentLayoutOptionsContext);
  if (!layoutOptions) return undefined;
  return layoutOptions.fieldUiOptions[
    `$${fieldPath}` as `$${string}`
  ];
}
