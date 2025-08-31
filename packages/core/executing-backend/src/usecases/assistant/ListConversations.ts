import type { Backend, Conversation, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import Usecase from "../../utils/Usecase.js";

export default class AssistantListConversations extends Usecase<
  Backend["assistant"]["listConversations"]
> {
  async exec(): ResultPromise<
    Omit<Conversation, "messages">[],
    UnexpectedError
  > {
    throw new Error("Method not implemented.");
  }
}
