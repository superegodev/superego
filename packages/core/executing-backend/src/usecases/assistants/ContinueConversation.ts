import {
  type Backend,
  type CannotCreateAssistant,
  type Conversation,
  type ConversationId,
  type ConversationNotFound,
  type Message,
  type MessagePart,
  MessageRole,
  type RpcResultPromise,
} from "@superego/backend";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import Usecase from "../../utils/Usecase.js";
import AssistantRetryContinueConversation from "./RetryContinueConversation.js";

export default class AssistantsContinueConversation extends Usecase<
  Backend["assistants"]["continueConversation"]
> {
  async exec(
    id: ConversationId,
    messagePart: MessagePart.Text & { contentType: "text/plain" },
  ): RpcResultPromise<
    Conversation,
    ConversationNotFound | CannotCreateAssistant
  > {
    const conversation = await this.repos.conversation.find(id);
    if (!conversation) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("ConversationNotFound", { conversationId: id }),
      );
    }

    const message: Message = {
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
