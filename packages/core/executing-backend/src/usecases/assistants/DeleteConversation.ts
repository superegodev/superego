import type {
  Backend,
  ConversationNotFound,
  DeletedEntities,
  RpcResultPromise,
} from "@superego/backend";
import Usecase from "../../utils/Usecase.js";

export default class AssistantsDeleteConversation extends Usecase<
  Backend["assistants"]["deleteConversation"]
> {
  async exec(): RpcResultPromise<DeletedEntities, ConversationNotFound> {
    throw new Error("Method not implemented.");
  }
}
