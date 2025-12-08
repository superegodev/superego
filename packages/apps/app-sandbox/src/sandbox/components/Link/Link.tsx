import type { CSSProperties, ReactNode } from "react";
import { Link as LinkRAC } from "react-aria-components";
import useNavigateHostTo from "../../business-logic/host-navigation/useNavigateHostTo.js";

interface Props {
  href: string;
  target?: string | undefined;
  style?: CSSProperties | undefined;
  children: ReactNode;
}
export default function Link({ href, target, style, children }: Props) {
  const navigateHostTo = useNavigateHostTo();
  return (
    <LinkRAC
      target={target}
      href={target === "_top" ? undefined : href}
      onPress={target === "_top" ? () => navigateHostTo(href) : undefined}
      style={style}
    >
      {children}
    </LinkRAC>
  );
}
