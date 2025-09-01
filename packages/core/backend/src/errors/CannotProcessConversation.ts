import type { ResultError } from "@superego/global-types";
import type ConversationId from "../ids/ConversationId.js";

type CannotProcessConversation = ResultError<
  "CannotProcessConversation",
  {
    conversationId: ConversationId;
    reason: "ConversationStatusNotProcessing" | "ConversationContextChanged";
  }
>;
export default CannotProcessConversation;
