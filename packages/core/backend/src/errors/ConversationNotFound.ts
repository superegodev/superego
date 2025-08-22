import type ConversationId from "../ids/ConversationId.js";
import type RpcError from "../types/RpcError.js";

type ConversationNotFound = RpcError<
  "ConversationNotFound",
  {
    conversationId: ConversationId;
  }
>;
export default ConversationNotFound;
