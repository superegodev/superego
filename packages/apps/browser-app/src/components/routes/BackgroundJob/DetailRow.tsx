import type { ReactNode } from "react";
import * as cs from "./BackgroundJob.css.js";

interface Props {
  label: string;
  children: ReactNode;
}
export default function DetailRow({ label, children }: Props) {
  return (
    <div className={cs.DetailRow.root}>
      <dt className={cs.DetailRow.label}>{label}</dt>
      <dd className={cs.DetailRow.value}>{children}</dd>
    </div>
  );
}
