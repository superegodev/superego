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
  MessageContentPartType,
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
import getConversationContextFingerprint from "../../utils/getConversationContextFingerprint.js";
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
      await getConversationContextFingerprint(collections);
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
                : "ConversationContextChanged",
        }),
      );
    }

    const transcribedUserMessageContent =
      await this.transcribeUserMessageContent(userMessageContent);

    const userMessage: Message.User = {
      role: MessageRole.User,
      content: transcribedUserMessageContent,
      createdAt: new Date(),
    };
    const updatedConversation: ConversationEntity = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      status: ConversationStatus.Processing,
    };
    await this.repos.conversation.upsert(updatedConversation);

    await this.enqueueBackgroundJob(BackgroundJobName.ProcessConversation, {
      id,
    });

    return makeSuccessfulResult(makeConversation(updatedConversation));
  }

  private async transcribeUserMessageContent(
    userMessageContent: Message.User["content"],
  ): Promise<NonEmptyArray<MessageContentPart>> {
    const { inference } = await this.repos.globalSettings.get();
    const inferenceService = this.inferenceServiceFactory.create(inference);
    return (
      await Promise.all(
        userMessageContent.map(async (part) =>
          part.type === MessageContentPartType.Audio
            ? [
                part,
                {
                  type: MessageContentPartType.Text,
                  text: await inferenceService.stt(part.audio),
                },
              ]
            : part,
        ),
      )
    ).flat() as NonEmptyArray<MessageContentPart>;
  }
}
