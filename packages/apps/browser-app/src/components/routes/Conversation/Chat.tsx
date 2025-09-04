import { type Conversation, ConversationStatus } from "@superego/backend";
import { useLayoutEffect } from "react";
import { useContinueConversation } from "../../../business-logic/backend/hooks.js";
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
  const { mutate } = useContinueConversation();
  // We want to observe messages to scroll to top when new are added.
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above.
  useLayoutEffect(() => {
    setTimeout(() => {
      document
        .querySelector('[data-slot="Main"]')
        ?.scrollTo({ top: 1e6, behavior: "smooth" });
    }, 15);
  }, [conversation.messages.length]);
  return (
    <>
      <div className={cs.Chat.userMessageContentInputContainer}>
        <UserMessageContentInput
          onSend={(userMessageContent) => {
            mutate(conversation.id, userMessageContent);
          }}
          autoFocus={true}
          isProcessingMessage={
            conversation.status === ConversationStatus.Processing
          }
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
