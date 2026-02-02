import type { BackgroundJobStatus as BackgroundJobStatusB } from "@superego/backend";
import * as cs from "./BackgroundJobStatus.css.js";

interface Props {
  status: BackgroundJobStatusB;
}
export default function BackgroundJobStatus({ status }: Props) {
  return <span className={cs.BackgroundJobStatus.root[status]}>{status}</span>;
}
