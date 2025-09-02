import type { Conversation } from "@superego/backend";
import classnames from "../../../utils/classnames.js";
import ConversationMessage from "./ConversationMessage.js";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  conversation: Conversation;
  showTechnicalLog: boolean;
  className?: string | undefined;
}
export default function ConversationMessages({
  conversation,
  showTechnicalLog,
  className,
}: Props) {
  // TODO: add Thinking...
  return (
    <div className={classnames(cs.ConversationMessages.root, className)}>
      {conversation.messages.map((message, index) => (
        <ConversationMessage
          // biome-ignore lint/suspicious/noArrayIndexKey: order is stable.
          key={index}
          message={message}
          showTechnicalLog={showTechnicalLog}
        />
      ))}
    </div>
  );
}
