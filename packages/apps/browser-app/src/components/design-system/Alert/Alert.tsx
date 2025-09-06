import type { ReactNode } from "react";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Alert.css.js";

interface Props {
  variant: "error" | "info";
  title?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}
export default function Alert({ variant, title, children, className }: Props) {
  return (
    <section
      role="alert"
      className={classnames(cs.Alert.root[variant], className)}
    >
      {title ? <h3 className={cs.Alert.title[variant]}>{title}</h3> : null}
      {children}
    </section>
  );
}
