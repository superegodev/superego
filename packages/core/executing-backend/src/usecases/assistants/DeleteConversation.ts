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
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class AssistantsDeleteConversation extends BackendUsecase<
  Backend["assistants"]["deleteConversation"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.conversationId(),
    v.string(),
  ]);
  resultSchema = structuralSchemas.global.result(v.null(), [
    structuralSchemas.backend.errors.commandConfirmationNotValid(),
    structuralSchemas.backend.errors.conversationNotFound(),
    structuralSchemas.backend.errors.unexpectedError(),
  ]);

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
    this.liveConversationStore.delete(id);

    return makeSuccessfulResult(null);
  }
}
