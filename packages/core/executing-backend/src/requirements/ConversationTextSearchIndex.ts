import type { ConversationId } from "@superego/backend";

export default interface ConversationTextSearchIndex {
  upsert(
    conversationId: ConversationId,
    textChunks: { title: string[]; messages: string[] },
  ): Promise<void>;
  remove(conversationId: ConversationId): Promise<void>;
  search(
    query: string,
    options: { limit: number },
  ): Promise<
    {
      conversationId: ConversationId;
      matchedText: string;
    }[]
  >;
}
