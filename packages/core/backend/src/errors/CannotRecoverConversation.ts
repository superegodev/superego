import type ConversationId from "../ids/ConversationId.js";
import type RpcError from "../types/RpcError.js";

type CannotRecoverConversation = RpcError<
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
