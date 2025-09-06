import type AssistantName from "../enums/AssistantName.js";
import type ConversationFormat from "../enums/ConversationFormat.js";
import type ConversationStatus from "../enums/ConversationStatus.js";
import type ConversationId from "../ids/ConversationId.js";
import type Message from "./Message.js";

type Conversation = {
  id: ConversationId;
  assistant: AssistantName;
  format: ConversationFormat;
  title: string;
  // TODO: hide this property from the Backend types, keeping it only on the
  // entity. Use instead canBeContinued + canBeRecovered.
  contextFingerprint: string;
  // TODO: add model that was used. This way we can ensure that a conversation
  // is only done with one model.
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
