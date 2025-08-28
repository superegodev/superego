import type { Conversation } from "@superego/backend";
import classnames from "../../../utils/classnames.js";
import ConversationMessage from "./ConversationMessage.js";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  conversation: Conversation;
  className?: string | undefined;
}
export default function ConversationMessages({
  conversation,
  className,
}: Props) {
  return (
    <div className={classnames(cs.ConversationMessages.root, className)}>
      {conversation.messages.map((message, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: order is stable.
        <ConversationMessage key={index} message={message} />
      ))}
    </div>
  );
}
