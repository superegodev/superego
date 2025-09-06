import {
  type AssistantName,
  type Backend,
  BackgroundJobName,
  type Conversation,
  type ConversationFormat,
  ConversationStatus,
  type Message,
  type MessageContentPart,
  MessageContentPartType,
  MessageRole,
  type NonEmptyArray,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { Id } from "@superego/shared-utils";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import getConversationContextFingerprint from "../../utils/getConversationContextFingerprint.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsStartConversation extends Usecase<
  Backend["assistants"]["startConversation"]
> {
  async exec(
    assistant: AssistantName,
    format: ConversationFormat,
    userMessageContent: Message.User["content"],
  ): ResultPromise<Conversation, UnexpectedError> {
    const { data: collections } = await this.sub(CollectionsList).exec();
    if (!collections) {
      throw new UnexpectedAssistantError("Getting collections failed.");
    }

    const transcribedUserMessageContent =
      await this.transcribeUserMessageContent(userMessageContent);

    const now = new Date();
    const userMessage: Message.User = {
      role: MessageRole.User,
      content: transcribedUserMessageContent,
      createdAt: now,
    };
    const conversation: ConversationEntity = {
      id: Id.generate.conversation(),
      assistant: assistant,
      format: format,
      title: AssistantsStartConversation.getTitle(
        transcribedUserMessageContent,
      ),
      contextFingerprint: await getConversationContextFingerprint(collections),
      messages: [userMessage],
      status: ConversationStatus.Processing,
      error: null,
      createdAt: now,
    };
    await this.repos.conversation.upsert(conversation);

    await this.enqueueBackgroundJob(BackgroundJobName.ProcessConversation, {
      id: conversation.id,
    });

    return makeSuccessfulResult(makeConversation(conversation));
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

  private static getTitle(userMessageContent: Message.User["content"]): string {
    return (
      userMessageContent.find(
        (part) => part.type === MessageContentPartType.Text,
      )?.text ?? "Failed to get title"
    );
  }
}
