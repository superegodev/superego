import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
export default function Trigger({ children }: Props) {
  return children;
}
