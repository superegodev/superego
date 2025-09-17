import { type Conversation, MessageRole } from "@superego/backend";
import { useEffect, useRef } from "react";
import { useContinueConversation } from "../../../business-logic/backend/hooks.js";
import last from "../../../utils/last.js";
import ConversationMessages from "../ConversationMessages/ConversationMessages.js";
import UserMessageContentInput from "../UserMessageContentInput/UserMessageContentInput.js";
import * as cs from "./Chat.css.js";

interface Props {
  conversation: Conversation;
  userMessageContentInputPlaceholder: string;
  showToolsCalls: boolean;
}
export default function Chat({
  conversation,
  userMessageContentInputPlaceholder,
  showToolsCalls,
}: Props) {
  // TODO: use https://react-spectrum.adobe.com/react-aria/Toast.html for
  // displaying errors.
  const { isPending, mutate } = useContinueConversation();

  // When messages change, scroll to bottom and - if the last message is an
  // assistant message - focus the input.
  const lastMessage = last(conversation.messages);
  const lastMessageTimestamp =
    lastMessage && "createdAt" in lastMessage
      ? lastMessage.createdAt.getTime()
      : null;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (lastMessageTimestamp) {
      // Hack: scrolling doesn't work unless we delay it a bit.
      setTimeout(() => {
        document.querySelector('[data-slot="Main"]')?.scrollTo({
          top: 1e6,
          behavior:
            Date.now() - lastMessageTimestamp < 10_000 ? "smooth" : "instant",
        });
      }, 15);
    }
    if (lastMessage?.role === MessageRole.Assistant) {
      inputRef.current?.focus();
    }
  }, [lastMessage, lastMessageTimestamp]);

  return (
    <div className={cs.Chat.root}>
      <div className={cs.Chat.userMessageContentInputContainer}>
        <UserMessageContentInput
          conversation={conversation}
          onSend={(messageContent) => mutate(conversation.id, messageContent)}
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
