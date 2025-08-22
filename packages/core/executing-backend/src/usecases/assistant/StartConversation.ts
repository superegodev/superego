import type {
  Backend,
  Conversation,
  RpcResultPromise,
} from "@superego/backend";
import Usecase from "../../utils/Usecase.js";

export default class AssistantStartConversation extends Usecase<
  Backend["assistant"]["startConversation"]
> {
  async exec(): RpcResultPromise<Conversation> {
    throw new Error("Method not implemented.");
  }
}
