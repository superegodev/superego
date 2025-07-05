import type { ReactNode } from "react";
import * as cs from "./Section.css.js";

interface Props {
  title: string;
  children: ReactNode;
}
export default function Section({ title, children }: Props) {
  return (
    <section className={cs.Section.root}>
      <h2 className={cs.Section.title}>{title}</h2>
      {children}
    </section>
  );
}
