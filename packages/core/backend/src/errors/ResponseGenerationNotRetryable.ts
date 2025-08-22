import type ConversationId from "../ids/ConversationId.js";
import type RpcError from "../types/RpcError.js";

type ResponseGenerationNotRetryable = RpcError<
  "ResponseGenerationNotRetryable",
  {
    conversationId: ConversationId;
  }
>;
export default ResponseGenerationNotRetryable;
