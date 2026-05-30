import type {
  Backend,
  Conversation,
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
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsGetConversation extends BackendUsecase<
  Backend["assistants"]["getConversation"]
> {
  argumentsSchema = v.tuple([structuralSchemas.backend.ids.conversationId()]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.conversation(),
    [
      structuralSchemas.backend.errors.conversationNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    id: ConversationId,
  ): ResultPromise<Conversation, ConversationNotFound | UnexpectedError> {
    const conversation = await this.repos.conversation.find(id);
    if (!conversation) {
      return makeUnsuccessfulResult(
        makeResultError("ConversationNotFound", { conversationId: id }),
      );
    }

    const { data: collections } = await this.sub(CollectionsList).exec(false);
    if (!collections) {
      throw new UnexpectedAssistantError("Getting collections failed.");
    }
    const contextFingerprint =
      await ConversationUtils.getContextFingerprint(collections);

    return makeSuccessfulResult(
      makeConversation(conversation, contextFingerprint),
    );
  }
}
