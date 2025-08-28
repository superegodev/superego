import type { Conversation } from "@superego/backend";
import ConversationMessage from "./ConversationMessage.js";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  conversation: Conversation;
}
export default function ConversationMessages({ conversation }: Props) {
  return (
    <div className={cs.ConversationMessages.root}>
      {conversation.messages.map((message, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: order is stable.
        <ConversationMessage key={index} message={message} />
      ))}
    </div>
  );
}
