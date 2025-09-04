import type { ConversationFormat as ConversationFormatB } from "@superego/backend";
import * as cs from "./ConversationFormat.css.js";

interface Props {
  format: ConversationFormatB;
}
export default function ConversationFormat({ format }: Props) {
  return <span className={cs.ConversationFormat.root[format]}>{format}</span>;
}
