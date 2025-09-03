import { type Conversation, ConversationStatus } from "@superego/backend";
import { useContinueConversation } from "../../../business-logic/backend/hooks.js";
import UserMessageContentInput from "../../design-system/UserMessageContentInput/UserMessageContentInput.js";
import ConversationMessages from "../../widgets/ConversationMessages/ConversationMessages.js";
import * as cs from "./Conversation.css.js";

interface Props {
  conversation: Conversation;
}
export default function Chat({ conversation }: Props) {
  // TODO: use https://react-spectrum.adobe.com/react-aria/Toast.html for
  // displaying errors.
  const { mutate } = useContinueConversation();
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
        showTechnicalLog={true}
      />
    </>
  );
}
