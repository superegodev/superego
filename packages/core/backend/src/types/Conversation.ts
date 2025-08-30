import type ConversationFormat from "../enums/ConversationFormat.js";
import type ConversationStatus from "../enums/ConversationStatus.js";
import type ConversationId from "../ids/ConversationId.js";
import type Message from "./Message.js";

type Conversation = {
  id: ConversationId;
  format: ConversationFormat;
  title: string;
  contextFingerprint: string;
  messages: Message[];
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
