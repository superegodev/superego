import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";
import * as cs from "./Alert.css.js";

interface Props {
  variant: "neutral" | "info" | "error";
  title?: string | undefined;
  children: ReactNode;
  style?: CSSProperties | undefined;
  className?: string | undefined;
}
export default function Alert({
  variant,
  title,
  children,
  style,
  className,
}: Props) {
  return (
    <section
      role="alert"
      style={style}
      className={clsx(cs.Alert.root[variant], className)}
    >
      {title ? <h3 className={cs.Alert.title[variant]}>{title}</h3> : null}
      {children}
    </section>
  );
}
