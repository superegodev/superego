import type { ResultError } from "@superego/global-types";
import type ConversationId from "../ids/ConversationId.js";

type ConversationNotFound = ResultError<
  "ConversationNotFound",
  {
    conversationId: ConversationId;
  }
>;
export default ConversationNotFound;
