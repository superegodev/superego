import {
  type Backend,
  type CannotCreateAssistant,
  type Conversation,
  type ConversationType,
  type Message,
  type MessagePart,
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
    type: ConversationType,
    messagePart: MessagePart.Text & { contentType: "text/plain" },
  ): RpcResultPromise<Conversation, CannotCreateAssistant> {
    const now = new Date();
    const message: Message = {
      id: Id.generate.message(),
      role: MessageRole.User,
      parts: [messagePart],
      createdAt: now,
    };
    const conversation: ConversationEntity = {
      id: Id.generate.conversation(),
      title: messagePart.content,
      type: type,
      messages: [message],
      isGeneratingNextMessage: false,
      nextMessageGenerationError: null,
      createdAt: now,
    };

    return this.sub(AssistantRetryContinueConversation).exec(conversation);
  }
}
