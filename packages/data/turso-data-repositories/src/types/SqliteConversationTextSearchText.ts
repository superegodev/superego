import type { ConversationId } from "@superego/backend";

type SqliteConversationTextSearchText = {
  conversation_id: ConversationId;
  text: string;
};
export default SqliteConversationTextSearchText;
