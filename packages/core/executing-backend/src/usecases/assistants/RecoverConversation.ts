import {
  type Backend,
  BackgroundJobName,
  type CannotRecoverConversation,
  type Conversation,
  type ConversationId,
  type ConversationNotFound,
  ConversationStatus,
  type Message,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import getConversationContextFingerprint from "../../utils/getConversationContextFingerprint.js";
import last from "../../utils/last.js";
import type Millisecond from "../../utils/Millisecond.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";

const PROCESSING_TIMEOUT: Millisecond = 5 * 60 * 1000;

export default class AssistantsRecoverConversation extends Usecase<
  Backend["assistants"]["recoverConversation"]
> {
  async exec(
    id: ConversationId,
  ): ResultPromise<
    Conversation,
    ConversationNotFound | CannotRecoverConversation | UnexpectedError
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
      await getConversationContextFingerprint(collections);
    const canBeRecovered =
      ((conversation.status === ConversationStatus.Processing &&
        lastMessageOlderThan(conversation.messages, PROCESSING_TIMEOUT)) ||
        conversation.status === ConversationStatus.Error) &&
      conversation.contextFingerprint === contextFingerprint;
    if (!canBeRecovered) {
      return makeUnsuccessfulResult(
        makeResultError("CannotRecoverConversation", {
          conversationId: id,
          reason:
            conversation.status === ConversationStatus.Idle
              ? "ConversationIsIdle"
              : conversation.status === ConversationStatus.Processing
                ? "ConversationIsProcessing"
                : "ConversationHasOutdatedContext",
        }),
      );
    }

    const updatedConversation: ConversationEntity = {
      ...conversation,
      status: ConversationStatus.Processing,
      error: null,
    };
    await this.repos.conversation.upsert(updatedConversation);

    await this.enqueueBackgroundJob(BackgroundJobName.ProcessConversation, {
      id,
    });

    return makeSuccessfulResult(
      makeConversation(updatedConversation, contextFingerprint),
    );
  }
}

function lastMessageOlderThan(
  messages: Message[],
  threshold: Millisecond,
): boolean {
  const lastMessage = last(messages);
  return (
    lastMessage !== null &&
    "createdAt" in lastMessage &&
    Date.now() - lastMessage.createdAt.getTime() > threshold
  );
}
