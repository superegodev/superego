import type MessageRole from "../enums/MessageRole.js";
import type MessagePart from "./MessagePart.js";

export default interface Message {
  // EVOLUTION:
  // - id, to link a document to the specific message that created it.
  // - additional meta-info like model and agent.
  role: MessageRole;
  parts: MessagePart[];
  createdAt: Date;
}
