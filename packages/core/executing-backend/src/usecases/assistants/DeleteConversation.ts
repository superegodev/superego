import type {
  Backend,
  CommandConfirmationNotValid,
  ConversationId,
  ConversationNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import Usecase from "../../utils/Usecase.js";

export default class AssistantsDeleteConversation extends Usecase<
  Backend["assistants"]["deleteConversation"]
> {
  async exec(
    id: ConversationId,
    commandConfirmation: string,
  ): ResultPromise<
    null,
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

    return makeSuccessfulResult(null);
  }
}
