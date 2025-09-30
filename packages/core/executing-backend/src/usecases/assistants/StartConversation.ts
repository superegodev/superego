import {
  type AssistantName,
  type Backend,
  BackgroundJobName,
  type Conversation,
  type ConversationFormat,
  ConversationStatus,
  type Message,
  MessageRole,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { Id } from "@superego/shared-utils";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
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
    const contextFingerprint =
      await ConversationUtils.getContextFingerprint(collections);

    const now = new Date();
    const userMessage: Message.User = {
      role: MessageRole.User,
      content: userMessageContent,
      createdAt: now,
    };
    const conversation: ConversationEntity = {
      id: Id.generate.conversation(),
      assistant: assistant,
      format: format,
      title: null,
      contextFingerprint: contextFingerprint,
      messages: [userMessage],
      status: ConversationStatus.Processing,
      error: null,
      createdAt: now,
    };
    await this.repos.conversation.upsert(conversation);

    await this.enqueueBackgroundJob({
      name: BackgroundJobName.ProcessConversation,
      input: { id: conversation.id },
    });

    return makeSuccessfulResult(
      makeConversation(conversation, contextFingerprint),
    );
  }
}
