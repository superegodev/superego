import type { ConversationStatus as ConversationStatusB } from "@superego/backend";
import * as cs from "./ConversationStatus.css.js";

interface Props {
  status: ConversationStatusB;
}
export default function ConversationStatus({ status }: Props) {
  return <div className={cs.ConversationStatus.root[status]}>{status}</div>;
}
