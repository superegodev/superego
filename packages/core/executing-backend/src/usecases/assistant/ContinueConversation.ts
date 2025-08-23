import {
  type Backend,
  type Conversation,
  type ConversationId,
  type ConversationNotFound,
  type Message,
  type MessagePart,
  MessagePartType,
  MessageRole,
  type RpcResultPromise,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import Usecase from "../../utils/Usecase.js";
import AssistantRetryContinueConversation from "./RetryContinueConversation.js";

export default class AssistantContinueConversation extends Usecase<
  Backend["assistant"]["continueConversation"]
> {
  async exec(
    id: ConversationId,
    protoMessagePart:
      | Omit<MessagePart.Audio, "transcription">
      | (MessagePart.Text & { contentType: "text/plain" }),
  ): RpcResultPromise<Conversation, ConversationNotFound> {
    const conversation = await this.repos.conversation.find(id);
    if (!conversation) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("ConversationNotFound", { conversationId: id }),
      );
    }

    const messagePart: MessagePart =
      protoMessagePart.type === MessagePartType.Audio
        ? {
            ...protoMessagePart,
            transcription: await this.speechService.transcribe({
              content: protoMessagePart.content,
              contentType: protoMessagePart.contentType,
            }),
          }
        : protoMessagePart;
    const message: Message = {
      id: Id.generate.message(),
      role: MessageRole.User,
      parts: [messagePart],
      createdAt: new Date(),
    };
    const continuedConversation: ConversationEntity = {
      ...conversation,
      messages: [...conversation.messages, message],
    };

    return this.sub(AssistantRetryContinueConversation).exec(
      continuedConversation,
    );
  }
}
