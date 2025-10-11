import {
  type Backend,
  BackgroundJobName,
  type CannotContinueConversation,
  type Conversation,
  type ConversationId,
  type ConversationNotFound,
  ConversationStatus,
  type Message,
  type MessageContentPart,
  MessageRole,
  type NonEmptyArray,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsContinueConversation extends Usecase<
  Backend["assistants"]["continueConversation"]
> {
  async exec(
    id: ConversationId,
    userMessageContent: NonEmptyArray<MessageContentPart.Text>,
  ): ResultPromise<
    Conversation,
    ConversationNotFound | CannotContinueConversation | UnexpectedError
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
    if (
      conversation.status !== ConversationStatus.Idle ||
      conversation.contextFingerprint !== contextFingerprint
    ) {
      return makeUnsuccessfulResult(
        makeResultError("CannotContinueConversation", {
          conversationId: id,
          reason:
            conversation.status === ConversationStatus.Processing
              ? "ConversationIsProcessing"
              : conversation.status === ConversationStatus.Error
                ? "ConversationHasError"
                : "ConversationHasOutdatedContext",
        }),
      );
    }

    const userMessage: Message.User = {
      role: MessageRole.User,
      content: userMessageContent,
      createdAt: new Date(),
    };
    const updatedConversation: ConversationEntity = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      status: ConversationStatus.Processing,
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
