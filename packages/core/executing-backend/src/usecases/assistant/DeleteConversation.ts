import type {
  Backend,
  CommandConfirmationNotValid,
  ConversationId,
  ConversationNotFound,
  DeletedEntities,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import makeDeletedEntities from "../../makers/makeDeletedEntities.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import Usecase from "../../utils/Usecase.js";

export default class AssistantDeleteConversation extends Usecase<
  Backend["assistant"]["deleteConversation"]
> {
  async exec(
    id: ConversationId,
    commandConfirmation: string,
  ): ResultPromise<
    DeletedEntities,
    ConversationNotFound | CommandConfirmationNotValid | UnexpectedError
  > {
    if (commandConfirmation !== "delete") {
      return makeUnsuccessfulResult(
        makeResultError("CommandConfirmationNotValid", {
          requiredCommandConfirmation: "delete",
          suppliedCommandConfirmation: commandConfirmation,
        }),
      );
    }

    if (!(await this.repos.conversation.exists(id))) {
      return makeUnsuccessfulResult(
        makeResultError("ConversationNotFound", {
          conversationId: id,
        }),
      );
    }

    await this.repos.conversation.delete(id);

    return makeSuccessfulResult(makeDeletedEntities({ conversations: [id] }));
  }
}
