import type { ResultError } from "@superego/global-types";
import type ConversationId from "../ids/ConversationId.js";

type ConversationStatusNotProcessing = ResultError<
  "ConversationStatusNotProcessing",
  {
    conversationId: ConversationId;
  }
>;
export default ConversationStatusNotProcessing;
