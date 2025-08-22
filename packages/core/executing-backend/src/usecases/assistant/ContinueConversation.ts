import type {
  Backend,
  Conversation,
  ConversationNotFound,
  RpcResultPromise,
} from "@superego/backend";
import Usecase from "../../utils/Usecase.js";

export default class AssistantContinueConversation extends Usecase<
  Backend["assistant"]["continueConversation"]
> {
  async exec(): RpcResultPromise<Conversation, ConversationNotFound> {
    throw new Error("Method not implemented.");
  }
}
