import { type Conversation, ConversationStatus } from "@superego/backend";
import DataLoader from "../../../../business-logic/backend/DataLoader.js";
import { getLiveConversationQuery } from "../../../../business-logic/backend/hooks.js";
import ThinkingMessageContent from "./ThinkingMessageContent.js";

interface Props {
  conversation: Conversation;
}
export default function ThinkingMessage({ conversation }: Props) {
  return (
    <DataLoader
      queries={[
        getLiveConversationQuery([conversation.id], {
          pollingInterval: 200,
          pollWhile: (result) =>
            conversation.status === ConversationStatus.Processing ||
            result?.data !== null,
        }),
      ]}
      renderLoading={() => (
        <ThinkingMessageContent conversation={conversation} />
      )}
    >
      {(liveConversation) => (
        <ThinkingMessageContent
          conversation={
            (liveConversation as Conversation | null) ?? conversation
          }
          invalidateConversationId={
            !liveConversation ? conversation.id : undefined
          }
        />
      )}
    </DataLoader>
  );
}
