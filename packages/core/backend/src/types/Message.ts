import type MessageRole from "../enums/MessageRole.js";
import type MessageId from "../ids/MessageId.js";
import type MessagePart from "./MessagePart.js";

export default interface Message {
  // EVOLUTION:
  // - additional meta-info like model and agent.
  id: MessageId;
  role: MessageRole;
  parts: MessagePart[];
  createdAt: Date;
}
