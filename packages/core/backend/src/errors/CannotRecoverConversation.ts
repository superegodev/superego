import type { ResultError } from "@superego/global-types";
import type ConversationId from "../ids/ConversationId.js";

type CannotRecoverConversation = ResultError<
  "CannotRecoverConversation",
  {
    conversationId: ConversationId;
    reason:
      | "ConversationIsIdle"
      | "ConversationIsProcessing"
      | "ConversationContextChanged";
  }
>;
export default CannotRecoverConversation;
