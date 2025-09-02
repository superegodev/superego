import type { Conversation } from "@superego/backend";
import { useContinueConversation } from "../../../business-logic/backend/hooks.js";
import UserMessageContentInput from "../../design-system/UserMessageContentInput/UserMessageContentInput.jsx";
import ConversationMessages from "../../widgets/ConversationMessages/ConversationMessages.jsx";
import * as cs from "./Conversation.css.js";

interface Props {
  conversation: Conversation;
}
export default function Chat({ conversation }: Props) {
  // TODO: use https://react-spectrum.adobe.com/react-aria/Toast.html for
  // displaying errors.
  const { mutate, isPending } = useContinueConversation();
  return (
    <>
      <div className={cs.Chat.userMessageContentInputContainer}>
        <UserMessageContentInput
          onSend={(userMessageContent) => {
            mutate(conversation.id, userMessageContent);
          }}
          autoFocus={true}
          isProcessingMessage={isPending}
        />
      </div>
      <ConversationMessages
        conversation={conversation}
        className={cs.Chat.messages}
        showTechnicalLog={false}
      />
    </>
  );
}
