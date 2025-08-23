import type ConversationType from "../enums/ConversationType.js";
import type ConversationId from "../ids/ConversationId.js";
import type Message from "./Message.js";

export default interface Conversation {
  id: ConversationId;
  type: ConversationType;
  title: string | null;
  messages: Message[];
  isGeneratingNextMessage: boolean;
  nextMessageGenerationError: string | null;
  createdAt: Date;
}
