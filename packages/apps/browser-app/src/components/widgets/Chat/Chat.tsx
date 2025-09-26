import {
  type Conversation,
  type Message,
  MessageRole,
} from "@superego/backend";
import { useEffect, useRef } from "react";
import { useIntl } from "react-intl";
import { useContinueConversation } from "../../../business-logic/backend/hooks.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toastQueue from "../../../business-logic/toasts/toastQueue.js";
import classnames from "../../../utils/classnames.js";
import last from "../../../utils/last.js";
import ConversationMessages from "../ConversationMessages/ConversationMessages.js";
import UserMessageContentInput from "../UserMessageContentInput/UserMessageContentInput.js";
import * as cs from "./Chat.css.js";

interface Props {
  conversation: Conversation;
  userMessageContentInputPlaceholder: string;
  showToolsCalls: boolean;
  className?: string | undefined;
}
export default function Chat({
  conversation,
  userMessageContentInputPlaceholder,
  showToolsCalls,
  className,
}: Props) {
  const intl = useIntl();
  const { isPending, mutate } = useContinueConversation();

  // When messages change, scroll to bottom and - if the last message is an
  // assistant message - focus the input.
  const lastMessage = last(conversation.messages);
  const lastMessageCreatedAtTime =
    lastMessage && "createdAt" in lastMessage
      ? lastMessage.createdAt.getTime()
      : null;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // We want to avoid scrolling if the last message didn't change, even if the
  // ref of the message object changed. Since messages are immutable, we can use
  // the createdAt as an id: createdAt didn't change => message didn't change.
  // TODO: add id to message, so we can use that instead of the createdAt date.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useEffect(() => {
    if (lastMessageCreatedAtTime) {
      // Hack: scrolling doesn't work unless we delay it a bit.
      setTimeout(() => {
        document.querySelector('[data-slot="Main"]')?.scrollTo({
          top: 1e6,
          behavior:
            Date.now() - lastMessageCreatedAtTime < 10_000
              ? "smooth"
              : "instant",
        });
      }, 15);
    }
    if (lastMessage?.role === MessageRole.Assistant) {
      inputRef.current?.focus();
    }
  }, [lastMessageCreatedAtTime]);

  const onSend = async (messageContent: Message.User["content"]) => {
    const { error } = await mutate(conversation.id, messageContent);
    if (error) {
      console.error(error);
      toastQueue.add(
        {
          type: ToastType.Error,
          title: intl.formatMessage({
            defaultMessage: "Error sending message to assistant",
          }),
          description: error.name,
        },
        { timeout: 5_000 },
      );
    }
  };

  return (
    <div className={classnames(cs.Chat.root, className)}>
      <div className={cs.Chat.userMessageContentInputContainer}>
        <UserMessageContentInput
          conversation={conversation}
          onSend={onSend}
          isSending={isPending}
          placeholder={userMessageContentInputPlaceholder}
          autoFocus={true}
          textAreaRef={inputRef}
        />
      </div>
      <ConversationMessages
        conversation={conversation}
        className={cs.Chat.messages}
        showToolCalls={showToolsCalls}
      />
    </div>
  );
}
