import {
  type Conversation,
  ConversationStatus,
  MessageRole,
} from "@superego/backend";
import { useLayoutEffect, useRef } from "react";
import { useContinueConversation } from "../../../business-logic/backend/hooks.js";
import last from "../../../utils/last.js";
import UserMessageContentInput from "../../design-system/UserMessageContentInput/UserMessageContentInput.js";
import ConversationMessages from "../../widgets/ConversationMessages/ConversationMessages.js";
import * as cs from "./Conversation.css.js";

interface Props {
  conversation: Conversation;
  showToolsCalls: boolean;
}
export default function Chat({ conversation, showToolsCalls }: Props) {
  // TODO: use https://react-spectrum.adobe.com/react-aria/Toast.html for
  // displaying errors.
  const { mutate, isPending } = useContinueConversation();

  // When messages change, scroll to bottom and - if the last message is an
  // assistant message - focus the input.
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    // Hack: scrolling doesn't work unless we delay it a bit.
    setTimeout(() => {
      document
        .querySelector('[data-slot="Main"]')
        ?.scrollTo({ top: 1e6, behavior: "smooth" });
    }, 15);
    if (last(conversation.messages)?.role === MessageRole.Assistant) {
      inputRef.current?.focus();
    }
  }, [conversation.messages]);

  return (
    <>
      <div className={cs.Chat.userMessageContentInputContainer}>
        <UserMessageContentInput
          onSend={(userMessageContent) => {
            mutate(conversation.id, userMessageContent);
          }}
          autoFocus={true}
          isProcessingMessage={
            isPending || conversation.status === ConversationStatus.Processing
          }
          textAreaRef={inputRef}
        />
      </div>
      <ConversationMessages
        conversation={conversation}
        className={cs.Chat.messages}
        showToolCalls={showToolsCalls}
      />
    </>
  );
}
