import {
  type Backend,
  BackgroundJobName,
  type CannotRetryLastResponse,
  type Conversation,
  type ConversationId,
  type ConversationNotFound,
  ConversationStatus,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeResultError from "../../makers/makeResultError.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsRetryLastResponse extends Usecase<
  Backend["assistants"]["retryLastResponse"]
> {
  @validateArgs([valibotSchemas.id.conversation()])
  async exec(
    id: ConversationId,
  ): ResultPromise<
    Conversation,
    ConversationNotFound | CannotRetryLastResponse | UnexpectedError
  > {
    const conversation = await this.repos.conversation.find(id);
    if (!conversation) {
      return makeUnsuccessfulResult(
        makeResultError("ConversationNotFound", { conversationId: id }),
      );
    }

    const { data: collections } = await this.sub(CollectionsList).exec();
    if (!collections) {
      throw new UnexpectedAssistantError("Getting collections failed.");
    }
    const contextFingerprint =
      await ConversationUtils.getContextFingerprint(collections);
    const hadSideEffects = ConversationUtils.lastResponseHadSideEffects(
      conversation.messages,
    );
    const canBeRetried =
      conversation.status === ConversationStatus.Idle &&
      conversation.contextFingerprint === contextFingerprint &&
      !hadSideEffects;
    if (!canBeRetried) {
      return makeUnsuccessfulResult(
        makeResultError("CannotRetryLastResponse", {
          conversationId: id,
          reason: hadSideEffects
            ? "ResponseHadSideEffects"
            : conversation.status === ConversationStatus.Error
              ? "ConversationHasError"
              : conversation.status === ConversationStatus.Processing
                ? "ConversationIsProcessing"
                : "ConversationHasOutdatedContext",
        }),
      );
    }

    const updatedConversation: ConversationEntity = {
      ...conversation,
      messages: ConversationUtils.sliceOffLastResponse(conversation.messages),
      status: ConversationStatus.Processing,
      error: null,
    };
    await this.repos.conversation.upsert(updatedConversation);

    await this.enqueueBackgroundJob({
      name: BackgroundJobName.ProcessConversation,
      input: { id },
    });

    return makeSuccessfulResult(
      makeConversation(updatedConversation, contextFingerprint),
    );
  }
}
