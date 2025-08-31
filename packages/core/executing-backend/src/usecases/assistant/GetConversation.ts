import type {
  Backend,
  Conversation,
  ConversationNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import Usecase from "../../utils/Usecase.js";

export default class AssistantGetConversation extends Usecase<
  Backend["assistant"]["getConversation"]
> {
  async exec(): ResultPromise<
    Conversation,
    ConversationNotFound | UnexpectedError
  > {
    throw new Error("Method not implemented.");
  }
}
