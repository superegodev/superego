import type { Backend, Conversation, UnexpectedError } from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import makeConversation from "../../makers/makeConversation.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import Usecase from "../../utils/Usecase.js";

export default class AssistantListConversations extends Usecase<
  Backend["assistant"]["listConversations"]
> {
  async exec(): ResultPromise<
    Omit<Conversation, "messages">[],
    UnexpectedError
  > {
    const conversations = await this.repos.conversation.findAll();

    return makeSuccessfulResult(
      conversations
        .map(makeConversation)
        .map(({ messages, ...conversation }) => conversation),
    );
  }
}
