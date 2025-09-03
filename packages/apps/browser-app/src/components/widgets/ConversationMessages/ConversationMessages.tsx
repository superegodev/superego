import { type Conversation, ConversationStatus } from "@superego/backend";
import classnames from "../../../utils/classnames.js";
import ConversationMessage from "./ConversationMessage.js";
import * as cs from "./ConversationMessages.css.js";
import ErrorMessage from "./ErrorMessage.js";
import ThinkingMessage from "./ThinkingMessage.js";

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
      {conversation.status === ConversationStatus.Processing ? (
        <ThinkingMessage />
      ) : null}
      {conversation.status === ConversationStatus.Error ? (
        <ErrorMessage conversation={conversation} />
      ) : null}
    </div>
  );
}
