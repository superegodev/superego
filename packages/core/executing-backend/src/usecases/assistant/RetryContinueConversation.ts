import {
  type Backend,
  type CannotCreateAssistant,
  type CannotRetryContinueConversation,
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
import DocumentCreationFailed from "../../errors/DocumentCreationFailed.js";
import makeConversation from "../../makers/makeConversation.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import Assistant, { toAssistantMessage } from "../../requirements/Assistant.js";
import last from "../../utils/last.js";
import Usecase from "../../utils/Usecase.js";
import DocumentsCreate from "../documents/Create.js";

export default class AssistantRetryContinueConversation extends Usecase<
  Backend["assistant"]["retryContinueConversation"]
> {
  async exec(
    id: ConversationId,
  ): RpcResultPromise<
    Conversation,
    | ConversationNotFound
    | CannotRetryContinueConversation
    | CannotCreateAssistant
  >;
  async exec(
    conversation: ConversationEntity,
  ): RpcResultPromise<Conversation, CannotCreateAssistant>;
  async exec(
    idOrConversation: ConversationId | ConversationEntity,
  ): RpcResultPromise<
    Conversation,
    | ConversationNotFound
    | CannotRetryContinueConversation
    | CannotCreateAssistant
  > {
    let conversation: ConversationEntity | null;
    if (typeof idOrConversation === "string") {
      conversation = await this.repos.conversation.find(idOrConversation);
      if (!conversation) {
        return makeUnsuccessfulRpcResult(
          makeRpcError("ConversationNotFound", {
            conversationId: idOrConversation,
          }),
        );
      }

      if (!AssistantRetryContinueConversation.isRetryable(conversation)) {
        return makeUnsuccessfulRpcResult(
          makeRpcError("CannotRetryContinueConversation", {
            conversationId: idOrConversation,
          }),
        );
      }
    } else {
      conversation = idOrConversation;
    }

    let assistant: Assistant;
    try {
      assistant = await this.getAssistant();
    } catch {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CannotCreateAssistant", null),
      );
    }

    await this.repos.conversation.upsert({
      ...conversation,
      isGeneratingNextMessage: true,
      nextMessageGenerationError: null,
    });
    const collections = await this.repos.collection.findAll();
    const result = await assistant.generateNextMessage(
      conversation.type,
      conversation.messages.map(toAssistantMessage),
      collections,
    );

    const updatedConversation: ConversationEntity = result.success
      ? {
          ...conversation,
          messages: [
            ...conversation.messages,
            await this.executeAndConvertAssistantMessage(result.message),
          ],
          isGeneratingNextMessage: false,
          nextMessageGenerationError: null,
        }
      : {
          ...conversation,
          isGeneratingNextMessage: false,
          nextMessageGenerationError: result.error,
        };
    await this.repos.conversation.upsert(updatedConversation);

    return makeSuccessfulRpcResult(makeConversation(conversation));
  }

  private async getAssistant(): Promise<Assistant> {
    const globalSettings = await this.repos.globalSettings.get();
    return this.assistantManager.getAssistant(globalSettings.assistant);
  }

  private async executeAndConvertAssistantMessage(
    message: Assistant.Message,
  ): Promise<Message> {
    return {
      id: Id.generate.message(),
      role: MessageRole.Assistant,
      parts: await Promise.all(
        message.parts.map((part) =>
          this.executeAndConvertAssistantMessagePart(part),
        ),
      ),
      createdAt: new Date(),
    };
  }

  private async executeAndConvertAssistantMessagePart(
    part: Assistant.MessagePart,
  ): Promise<MessagePart> {
    switch (part.type) {
      case Assistant.MessagePartType.Text: {
        return {
          type: MessagePartType.Text,
          content: part.content,
          contentType: part.contentType,
        };
      }
      case Assistant.MessagePartType.CreateDocument: {
        const result = await this.sub(DocumentsCreate).exec(
          part.collectionId,
          part.documentContent,
        );
        if (result.success) {
          return {
            type: MessagePartType.DocumentCreated,
            collectionId: result.data.collectionId,
            documentId: result.data.id,
            documentVersionId: result.data.latestVersion.id,
            documentContent: result.data.latestVersion.content,
          };
        }
        throw new DocumentCreationFailed(
          part.collectionId,
          part.documentContent,
        );
      }
    }
  }

  private static isRetryable(conversation: ConversationEntity): boolean {
    return (
      conversation.nextMessageGenerationError !== null &&
      last(conversation.messages)?.role === MessageRole.User
    );
  }
}
