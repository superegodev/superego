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
  type RpcResultPromise,
} from "@superego/backend";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import getConversationContextFingerprint from "../../utils/getConversationContextFingerprint.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";

export default class AssistantContinueConversation extends Usecase<
  Backend["assistant"]["continueConversation"]
> {
  async exec(
    id: ConversationId,
    userMessageContent: NonEmptyArray<MessageContentPart.Text>,
  ): RpcResultPromise<
    Conversation,
    ConversationNotFound | CannotContinueConversation
  > {
    const conversation = await this.repos.conversation.find(id);
    if (!conversation) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("ConversationNotFound", { conversationId: id }),
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
      return makeUnsuccessfulRpcResult(
        makeRpcError("CannotContinueConversation", {
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

    await this.enqueueBackgroundJob(BackgroundJobName.ProcessConversation, {
      conversationId: id,
    });

    return makeSuccessfulRpcResult(makeConversation(updatedConversation));
  }
}
