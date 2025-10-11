import { createContext, useContext } from "react";

interface UiOptions {
  showTypes: boolean;
  showNullability: boolean;
  zoomLevel: number;
}

const UiOptionsContext = createContext({
  showTypes: true,
  showNullability: false,
  zoomLevel: 1,
});

export const UiOptionsProvider = UiOptionsContext.Provider;

export function useUiOptions(): UiOptions {
  return useContext(UiOptionsContext);
}
