import type ConversationId from "../ids/ConversationId.js";
import type RpcError from "../types/RpcError.js";

type CannotContinueConversation = RpcError<
  "CannotContinueConversation",
  {
    conversationId: ConversationId;
    reason: "ConversationCompleted" | "ConversationContextChanged";
  }
>;
export default CannotContinueConversation;
