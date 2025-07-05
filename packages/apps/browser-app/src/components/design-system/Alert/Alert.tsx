import type { ReactNode } from "react";
import * as cs from "./Alert.css.js";

interface Props {
  variant: "error";
  title: string;
  children: ReactNode;
}
export default function Alert({ variant, title, children }: Props) {
  return (
    <section role="alert" className={cs.Alert.root[variant]}>
      <h3 className={cs.Alert.title[variant]}>{title}</h3>
      {children}
    </section>
  );
}
