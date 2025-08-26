import type Assistant from "../enums/Assistant.js";
import type ConversationFormat from "../enums/ConversationFormat.js";
import type ConversationStatus from "../enums/ConversationStatus.js";
import type ConversationId from "../ids/ConversationId.js";
import type Message from "./Message.js";

export default interface Conversation {
  id: ConversationId;
  assistant: Assistant;
  format: ConversationFormat;
  title: string;
  conversationContextFingerprint: string;
  status: ConversationStatus;
  messages: Message[];
  createdAt: Date;
}
