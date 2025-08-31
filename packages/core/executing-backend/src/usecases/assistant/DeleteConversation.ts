import type {
  Backend,
  ConversationNotFound,
  DeletedEntities,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import Usecase from "../../utils/Usecase.js";

export default class AssistantDeleteConversation extends Usecase<
  Backend["assistant"]["deleteConversation"]
> {
  async exec(): ResultPromise<
    DeletedEntities,
    ConversationNotFound | UnexpectedError
  > {
    throw new Error("Method not implemented.");
  }
}
