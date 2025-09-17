import { AssistantName } from "@superego/backend";
import * as cs from "./ConversationAssistant.css.js";

interface Props {
  assistant: AssistantName;
}
export default function ConversationAssistant({ assistant }: Props) {
  return (
    <span className={cs.ConversationAssistant.root[assistant]}>
      {assistant === AssistantName.CollectionCreator
        ? "Collection Manager"
        : "Factotum"}
    </span>
  );
}
