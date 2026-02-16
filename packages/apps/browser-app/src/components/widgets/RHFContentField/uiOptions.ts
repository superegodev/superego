import type { DefaultDocumentViewUiOptions } from "@superego/backend";
import { createContext, useContext } from "react";

export interface UiOptions {
  showTypes: boolean;
  showNullability: boolean;
  zoomLevel: number;
  isReadOnly: boolean;
  protoCollections: {
    id: string;
    settings: {
      name: string;
      icon: string | null;
    };
  }[];
  defaultDocumentViewUiOptions: DefaultDocumentViewUiOptions | null;
}

const UiOptionsContext = createContext<UiOptions>({
  showTypes: true,
  showNullability: false,
  zoomLevel: 1,
  isReadOnly: false,
  protoCollections: [],
  defaultDocumentViewUiOptions: null,
});

export const UiOptionsProvider = UiOptionsContext.Provider;

export function useUiOptions(): UiOptions {
  return useContext(UiOptionsContext);
}
