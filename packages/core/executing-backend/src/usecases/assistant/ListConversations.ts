import type {
  Backend,
  Conversation,
  RpcResultPromise,
} from "@superego/backend";
import Usecase from "../../utils/Usecase.js";

export default class AssistantListConversations extends Usecase<
  Backend["assistant"]["listConversations"]
> {
  async exec(): RpcResultPromise<Omit<Conversation, "messages">[]> {
    throw new Error("Method not implemented.");
  }
}
