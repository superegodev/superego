import type {
  Backend,
  Conversation,
  ConversationNotFound,
  ResponseGenerationNotRetryable,
  RpcResultPromise,
} from "@superego/backend";
import Usecase from "../../utils/Usecase.js";

export default class AssistantRetryResponseGeneration extends Usecase<
  Backend["assistant"]["retryResponseGeneration"]
> {
  async exec(): RpcResultPromise<
    Conversation,
    ConversationNotFound | ResponseGenerationNotRetryable
  > {
    throw new Error("Method not implemented.");
  }
}
