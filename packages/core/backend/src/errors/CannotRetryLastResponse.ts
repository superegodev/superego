import type { ResultError } from "@superego/global-types";
import type ConversationId from "../ids/ConversationId.js";

type CannotRetryLastResponse = ResultError<
  "CannotRetryLastResponse",
  {
    conversationId: ConversationId;
    reason:
      | "ResponseHadSideEffects"
      | "ConversationHasError"
      | "ConversationIsProcessing"
      | "ConversationHasOutdatedContext";
  }
>;
export default CannotRetryLastResponse;
