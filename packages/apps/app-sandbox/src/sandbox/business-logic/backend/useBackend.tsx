import { createContext, type ReactNode, useContext } from "react";
import type Backend from "./Backend.js";

export const BackendContext = createContext<Backend | null>(null);

interface Props {
  backend: Backend;
  children: ReactNode;
}
export function BackendProvider({ backend, children }: Props) {
  return (
    <BackendContext.Provider value={backend}>
      {children}
    </BackendContext.Provider>
  );
}

export default function useBackend(): Backend {
  const backend = useContext(BackendContext);
  if (!backend) {
    throw new Error("Missing BackendProvider in the tree");
  }
  return backend;
}
