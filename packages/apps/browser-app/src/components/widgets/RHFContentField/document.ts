import type { Document } from "@superego/backend";
import { createContext, useContext } from "react";

const DocumentContext = createContext<Document | null>(null);

export const DocumentProvider = DocumentContext.Provider;

export function useDocument(): Document | null {
  return useContext(DocumentContext);
}
