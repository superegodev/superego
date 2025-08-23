import type ConversationId from "../ids/ConversationId.js";
import type RpcError from "../types/RpcError.js";

type CannotRetryContinueConversation = RpcError<
  "CannotRetryContinueConversation",
  {
    conversationId: ConversationId;
  }
>;
export default CannotRetryContinueConversation;
