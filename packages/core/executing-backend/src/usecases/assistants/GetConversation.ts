import type {
  Backend,
  Conversation,
  ConversationId,
  ConversationNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import makeConversation from "../../makers/makeConversation.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import Usecase from "../../utils/Usecase.js";

export default class AssistantsGetConversation extends Usecase<
  Backend["assistants"]["getConversation"]
> {
  async exec(
    id: ConversationId,
  ): ResultPromise<Conversation, ConversationNotFound | UnexpectedError> {
    const conversation = await this.repos.conversation.find(id);
    if (!conversation) {
      return makeUnsuccessfulResult(
        makeResultError("ConversationNotFound", { conversationId: id }),
      );
    }

    return makeSuccessfulResult(makeConversation(conversation));
  }
}
