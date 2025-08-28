import type { Message } from "@superego/backend";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  message: Message.ContentAssistant;
}
export default function AssistantContentMessage({ message }: Props) {
  return (
    <div className={cs.AssistantContentMessage.root}>
      {message.content[0].text}
    </div>
  );
}
