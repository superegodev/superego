import type { JSX, ReactNode } from "react";
import * as cs from "./Section.css.js";

interface Props {
  title: string;
  // Add more levels as necessary.
  level: 2 | 3 | 4;
  children: ReactNode;
}
export default function Section({ title, level, children }: Props) {
  const Heading = { 2: "h2", 3: "h3", 4: "h4" }[
    level
  ] as keyof JSX.IntrinsicElements;
  return (
    <section className={cs.Section.root}>
      <Heading className={cs.Section.title[level]}>{title}</Heading>
      {children}
    </section>
  );
}
