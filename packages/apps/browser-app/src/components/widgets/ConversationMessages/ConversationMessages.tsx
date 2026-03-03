import {
  type Conversation,
  ConversationStatus,
  MessageRole,
} from "@superego/backend";
import classnames from "../../../utils/classnames.js";
import ConversationMessage from "./ConversationMessage.js";
import * as cs from "./ConversationMessages.css.js";
import ErrorMessage from "./ErrorMessage.js";
import ThinkingMessage from "./ThinkingMessage/ThinkingMessage.js";
import useTailMinHeight from "./useTailMinHeight.js";

interface Props {
  conversation: Conversation;
  showToolCalls: boolean;
  className?: string | undefined;
}
export default function ConversationMessages({
  conversation,
  showToolCalls,
  className,
}: Props) {
  const lastUserMessageIndex = conversation.messages.findLastIndex(
    (message) => message.role === MessageRole.User,
  );

  const { tailMinHeight, lastUserMessageRef, tailRef } = useTailMinHeight([
    conversation.messages.length,
    conversation.status,
  ]);

  const headMessages = conversation.messages.slice(0, lastUserMessageIndex);
  const lastUserMessage =
    lastUserMessageIndex >= 0
      ? conversation.messages[lastUserMessageIndex]
      : null;
  const tailMessages = conversation.messages.slice(lastUserMessageIndex + 1);

  const tailContent = (
    <>
      {conversation.status === ConversationStatus.Processing ? (
        <ThinkingMessage conversation={conversation} />
      ) : null}
      {tailMessages.map((message, index) => (
        <ConversationMessage
          key={"id" in message ? message.id : `tail-${index}`}
          message={message}
          conversation={conversation}
          showToolCalls={showToolCalls}
        />
      ))}
      {conversation.status === ConversationStatus.Error ? (
        <ErrorMessage conversation={conversation} />
      ) : null}
    </>
  );

  if (!lastUserMessage) {
    return (
      <div className={classnames(cs.ConversationMessages.root, className)}>
        {tailContent}
      </div>
    );
  }

  return (
    <div className={classnames(cs.ConversationMessages.root, className)}>
      {headMessages.map((message, index) => (
        <ConversationMessage
          key={"id" in message ? message.id : index}
          message={message}
          conversation={conversation}
          showToolCalls={showToolCalls}
        />
      ))}
      <div ref={lastUserMessageRef}>
        <ConversationMessage
          key={
            "id" in lastUserMessage ? lastUserMessage.id : lastUserMessageIndex
          }
          message={lastUserMessage}
          conversation={conversation}
          showToolCalls={showToolCalls}
        />
      </div>
      <div
        ref={tailRef}
        className={cs.ConversationMessages.tail}
        style={{ minHeight: tailMinHeight > 0 ? tailMinHeight : undefined }}
      >
        {tailContent}
      </div>
    </div>
  );
}
