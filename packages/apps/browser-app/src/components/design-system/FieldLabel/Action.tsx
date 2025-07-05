import type { ReactNode } from "react";
import IconButton from "../IconButton/IconButton.js";

interface Props {
  label: string;
  onPress: () => void;
  className?: string | undefined;
  children: ReactNode;
}
export default function Action({ label, onPress, className, children }: Props) {
  return (
    <IconButton
      slot={null}
      variant="invisible"
      onPress={onPress}
      label={label}
      className={className}
      tooltipDelay={500}
    >
      {children}
    </IconButton>
  );
}
