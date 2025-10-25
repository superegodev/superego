import type { ReactNode } from "react";
import * as cs from "./Grid.css.js";

type SpanValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface Span {
  sm: SpanValue;
  md: SpanValue;
  lg: SpanValue;
}

interface Props {
  span: Partial<Span>;
  children: ReactNode;
}
export default function Col({ span, children }: Props) {
  const { sm, md, lg } = applyDefaults(span);
  const className = [
    cs.Col.root,
    cs.Col.spanSm[sm],
    cs.Col.spanMd[md],
    cs.Col.spanLg[lg],
  ].join(" ");

  return <div className={className}>{children}</div>;
}

function applyDefaults(span: Partial<Span>): Span {
  const defaultValue: SpanValue = 12;
  const sm = span.sm ?? span.md ?? span.lg ?? defaultValue;
  const md = span.md ?? span.lg ?? sm;
  const lg = span.lg ?? md;
  return { sm, md, lg };
}
