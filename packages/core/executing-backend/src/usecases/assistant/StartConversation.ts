import {
  type Backend,
  type Conversation,
  ConversationType,
  type Message,
  type MessagePart,
  MessagePartType,
  MessageRole,
  type RpcResultPromise,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import Usecase from "../../utils/Usecase.js";
import AssistantRetryContinueConversation from "./RetryContinueConversation.js";

export default class AssistantStartConversation extends Usecase<
  Backend["assistant"]["startConversation"]
> {
  async exec(
    protoMessagePart:
      | Omit<MessagePart.Audio, "transcription">
      | (MessagePart.Text & { contentType: "text/plain" }),
  ): RpcResultPromise<Conversation> {
    const now = new Date();
    const utterance =
      protoMessagePart.type === MessagePartType.Audio
        ? await this.speechService.transcribe({
            content: protoMessagePart.content,
            contentType: protoMessagePart.contentType,
          })
        : protoMessagePart.content;
    const messagePart: MessagePart =
      protoMessagePart.type === MessagePartType.Audio
        ? { ...protoMessagePart, transcription: utterance }
        : protoMessagePart;
    const message: Message = {
      id: Id.generate.message(),
      role: MessageRole.User,
      parts: [messagePart],
      createdAt: now,
    };
    const conversation: ConversationEntity = {
      id: Id.generate.conversation(),
      title: utterance,
      type:
        protoMessagePart.type === MessagePartType.Audio
          ? ConversationType.Voice
          : ConversationType.Text,
      messages: [message],
      isGeneratingNextMessage: false,
      nextMessageGenerationError: null,
      createdAt: now,
    };

    return this.sub(AssistantRetryContinueConversation).exec(conversation);
  }
}
