import type { CSSProperties, ReactNode } from "react";
import * as cs from "./Alert.css.js";

interface Props {
  variant: "neutral" | "info" | "error";
  title?: string | undefined;
  children: ReactNode;
  style?: CSSProperties | undefined;
}
export default function Alert({ variant, title, children, style }: Props) {
  return (
    <section role="alert" style={style} className={cs.Alert.root[variant]}>
      {title ? <h3 className={cs.Alert.title[variant]}>{title}</h3> : null}
      {children}
    </section>
  );
}
