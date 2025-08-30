import type {
  Backend,
  ConversationNotFound,
  DeletedEntities,
  RpcResultPromise,
} from "@superego/backend";
import Usecase from "../../utils/Usecase.js";

export default class AssistantDeleteConversation extends Usecase<
  Backend["assistant"]["deleteConversation"]
> {
  async exec(): RpcResultPromise<DeletedEntities, ConversationNotFound> {
    throw new Error("Method not implemented.");
  }
}
