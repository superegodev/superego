import { createContext, useContext } from "react";

interface UiOptions {
  showTypes: boolean;
  showNullability: boolean;
  zoomLevel: number;
  isReadOnly: boolean;
}

const UiOptionsContext = createContext({
  showTypes: true,
  showNullability: false,
  zoomLevel: 1,
  isReadOnly: false,
});

export const UiOptionsProvider = UiOptionsContext.Provider;

export function useUiOptions(): UiOptions {
  return useContext(UiOptionsContext);
}
