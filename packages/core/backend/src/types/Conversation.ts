import type AssistantName from "../enums/AssistantName.js";
import type ConversationStatus from "../enums/ConversationStatus.js";
import type ConversationId from "../ids/ConversationId.js";
import type Message from "./Message.js";

type Conversation = {
  id: ConversationId;
  assistant: AssistantName;
  title: string | null;
  hasOutdatedContext: boolean;
  canRetryLastResponse: boolean;
  messages: Message[];
  status: ConversationStatus;
  error: { name: string; details: any } | null;
  createdAt: Date;
} & (
  | {
      status: ConversationStatus.Idle | ConversationStatus.Processing;
      error: null;
    }
  | {
      status: ConversationStatus.Error;
      error: { name: string; details: any };
    }
);
export default Conversation;
