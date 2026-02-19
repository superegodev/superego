import type {
  Backend,
  CommandConfirmationNotValid,
  ConversationId,
  ConversationNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class AssistantsDeleteConversation extends Usecase<
  Backend["assistants"]["deleteConversation"]
> {
  @validateArgs([valibotSchemas.id.conversation(), v.string()])
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
    await this.repos.file.deleteReferenceFromAll({ conversationId: id });
    await this.repos.conversationTextSearchIndex.remove(id);

    return makeSuccessfulResult(null);
  }
}
