import type { ResultError } from "@superego/global-types";
import type ConversationId from "../ids/ConversationId.js";

type CannotContinueConversation = ResultError<
  "CannotContinueConversation",
  {
    conversationId: ConversationId;
    reason:
      | "ConversationIsProcessing"
      | "ConversationHasError"
      | "ConversationHasOutdatedContext";
  }
>;
export default CannotContinueConversation;
