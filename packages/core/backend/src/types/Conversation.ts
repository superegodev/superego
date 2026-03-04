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
  processingStartedAt: Date | null;
  error: { name: string; details: any } | null;
  createdAt: Date;
} & (
  | {
      status: ConversationStatus.Idle;
      processingStartedAt: null;
      error: null;
    }
  | {
      status: ConversationStatus.Processing;
      processingStartedAt: Date;
      error: null;
    }
  | {
      status: ConversationStatus.Error;
      processingStartedAt: null;
      error: { name: string; details: any };
    }
);
export default Conversation;
