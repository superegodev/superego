import type {
  Backend,
  Conversation,
  ConversationNotFound,
  RpcResultPromise,
} from "@superego/backend";
import Usecase from "../../utils/Usecase.js";

export default class AssistantsGetConversation extends Usecase<
  Backend["assistants"]["getConversation"]
> {
  async exec(): RpcResultPromise<Conversation, ConversationNotFound> {
    throw new Error("Method not implemented.");
  }
}
