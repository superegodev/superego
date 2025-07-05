import {
  createContext,
  type HTMLAttributes,
  type RefObject,
  useContext,
} from "react";
import type { AriaButtonProps } from "react-aria";

interface UseDisclosure {
  triggerProps: AriaButtonProps<"button">;
  panelRef: RefObject<HTMLDivElement | null>;
  panelProps: HTMLAttributes<HTMLElement>;
  isDisclosureDisabled: boolean;
}

const DisclosureContext = createContext<UseDisclosure | null>(null);

export const DisclosureProvider = DisclosureContext.Provider;

export function useDisclosure(): UseDisclosure {
  const disclosure = useContext(DisclosureContext);
  if (!disclosure) {
    throw new Error("You can only use this hook within a DisclosureProvider");
  }
  return disclosure;
}
