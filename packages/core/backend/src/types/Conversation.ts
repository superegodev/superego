import type AssistantName from "../enums/AssistantName.js";
import type ConversationFormat from "../enums/ConversationFormat.js";
import type ConversationId from "../ids/ConversationId.js";
import type Message from "./Message.js";

export default interface Conversation {
  id: ConversationId;
  assistant: AssistantName;
  format: ConversationFormat;
  title: string;
  contextFingerprint: string;
  messages: Message[];
  isCompleted: boolean;
  createdAt: Date;
}
