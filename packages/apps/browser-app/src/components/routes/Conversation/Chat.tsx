import type { Conversation } from "@superego/backend";
import ConversationMessages from "../../design-system/ConversationMessages/ConversationMessages.jsx";
import UserMessageContentInput from "../../design-system/UserMessageContentInput/UserMessageContentInput.jsx";
import * as cs from "./Conversation.css.js";

interface Props {
  conversation: Conversation;
}
export default function Chat({ conversation }: Props) {
  return (
    <>
      <div className={cs.Chat.userMessageContentInputContainer}>
        <UserMessageContentInput
          onSend={(userMessageContent) => {
            console.log(userMessageContent);
            // continueConversation(conversation.id, userMessageContent);
          }}
          autoFocus={true}
          isProcessingMessage={false} // TODO
        />
      </div>
      <ConversationMessages
        conversation={conversation}
        className={cs.Chat.messages}
      />
    </>
  );
}
