import { createContext, type ReactNode, useContext } from "react";
import MessageType from "../../../ipc/MessageType.js";
import type SandboxIpc from "../../../ipc/SandboxIpc.js";

export const HostNavigationContext = createContext<
  ((href: string) => void) | null
>(null);

interface Props {
  sandboxIpc: SandboxIpc;
  children: ReactNode;
}
export function HostNavigationProvider({ sandboxIpc, children }: Props) {
  return (
    <HostNavigationContext.Provider
      value={(href: string) =>
        sandboxIpc.send({ type: MessageType.NavigateHostTo, payload: { href } })
      }
    >
      {children}
    </HostNavigationContext.Provider>
  );
}

export default function useNavigateHostTo(): (href: string) => void {
  const navigateHostTo = useContext(HostNavigationContext);
  if (!navigateHostTo) {
    throw new Error("Missing HostNavigationProvider in the tree");
  }
  return navigateHostTo;
}
