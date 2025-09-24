import { createContext, useContext } from "react";

const ZoomLevelContext = createContext(1);

export const ZoomLevelProvider = ZoomLevelContext.Provider;

export function useZoomLevel(): number {
  return useContext(ZoomLevelContext);
}
