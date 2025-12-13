import type { ReactNode } from "react";
import { Link } from "react-aria-components";
import useNavigateHostTo from "../../business-logic/host-navigation/useNavigateHostTo.js";
import * as cs from "./ButtonLink.css.js";

interface Props {
  variant?: "default" | "primary" | "invisible" | undefined;
  href: string;
  target?: string | undefined;
  children: ReactNode;
}
export default function ButtonLink({
  variant = "default",
  href,
  target,
  children,
}: Props) {
  const navigateHostTo = useNavigateHostTo();
  return (
    <Link
      target={target}
      href={target === "_top" ? undefined : href}
      onPress={target === "_top" ? () => navigateHostTo(href) : undefined}
      className={cs.ButtonLink.root[variant]}
    >
      {children}
    </Link>
  );
}
