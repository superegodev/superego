import type { ConversationFormat, Message } from "@superego/backend";

export default interface Assistant {
  generateAndProcessNextMessages(
    conversationFormat: ConversationFormat,
    previousMessages: Message[],
  ): Promise<Message[]>;
}
