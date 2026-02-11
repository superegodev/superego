import clsx from "clsx";
import type { ReactNode } from "react";
import { Link } from "react-aria-components";
import useNavigateHostTo from "../../business-logic/host-navigation/useNavigateHostTo.js";
import * as cs from "./ButtonLink.css.js";

interface Props {
  variant?: "default" | "primary" | "invisible" | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  href: string;
  target?: string | undefined;
  children: ReactNode;
}
export default function ButtonLink({
  variant = "default",
  size = "md",
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
      className={clsx(cs.ButtonLink.root[variant], cs.ButtonLink.root[size])}
    >
      {children}
    </Link>
  );
}
