import {
  type Backend,
  BackgroundJobName,
  type CannotRetryLastResponse,
  type Conversation,
  type ConversationId,
  type ConversationNotFound,
  ConversationStatus,
  type InferenceOptions,
  type InferenceOptionsNotValid,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  validateInferenceOptions,
} from "@superego/shared-utils";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeResultError from "../../makers/makeResultError.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsRetryLastResponse extends Usecase<
  Backend["assistants"]["retryLastResponse"]
> {
  async exec(
    id: ConversationId,
    inferenceOptions: InferenceOptions<"completion">,
  ): ResultPromise<
    Conversation,
    | ConversationNotFound
    | CannotRetryLastResponse
    | InferenceOptionsNotValid
    | UnexpectedError
  > {
    const globalSettings = await this.repos.globalSettings.get();

    const inferenceOptionsIssues = validateInferenceOptions(
      inferenceOptions,
      globalSettings.inference,
    );
    if (!isEmpty(inferenceOptionsIssues)) {
      return makeUnsuccessfulResult(
        makeResultError("InferenceOptionsNotValid", {
          issues: inferenceOptionsIssues,
        }),
      );
    }

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
      input: { id, inferenceOptions },
    });

    return makeSuccessfulResult(
      makeConversation(updatedConversation, contextFingerprint),
    );
  }
}
