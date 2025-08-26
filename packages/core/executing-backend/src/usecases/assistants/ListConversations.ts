import type {
  Backend,
  Conversation,
  RpcResultPromise,
} from "@superego/backend";
import Usecase from "../../utils/Usecase.js";

export default class AssistantsListConversations extends Usecase<
  Backend["assistants"]["listConversations"]
> {
  async exec(): RpcResultPromise<Omit<Conversation, "messages">[]> {
    throw new Error("Method not implemented.");
  }
}
