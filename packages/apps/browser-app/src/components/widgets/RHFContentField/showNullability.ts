import { createContext, useContext } from "react";

const ShowNullabilityContext = createContext(false);

export const ShowNullabilityProvider = ShowNullabilityContext.Provider;

export function useShowNullability(): boolean {
  return useContext(ShowNullabilityContext);
}
