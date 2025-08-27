import {
  AssistantName,
  type Backend,
  type CannotContinueConversation,
  type CannotCreateInferenceService,
  type Collection,
  type Conversation,
  type ConversationFormat,
  type ConversationId,
  type ConversationNotFound,
  type Message,
  MessageRole,
  type RpcResultPromise,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import type Assistant from "../../assistants/Assistant.js";
import DocumentCreator from "../../assistants/DocumentCreator/DocumentCreator.js";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import type InferenceService from "../../requirements/InferenceService.js";
import getConversationContextFingerprint from "../../utils/getConversationContextFingerprint.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";
import DocumentsCreate from "../documents/Create.js";

export default class AssistantsStartOrContinueConversation extends Usecase<
  | Backend["assistants"]["startConversation"]
  | Backend["assistants"]["continueConversation"]
> {
  async exec(
    assistantName: AssistantName,
    format: ConversationFormat,
    userMessageContent: Message.User["content"],
  ): RpcResultPromise<Conversation, CannotCreateInferenceService>;
  async exec(
    id: ConversationId,
    userMessageContent: Message.User["content"],
  ): RpcResultPromise<
    Conversation,
    | CannotCreateInferenceService
    | ConversationNotFound
    | CannotContinueConversation
  >;
  async exec(
    ...args:
      | [AssistantName, ConversationFormat, Message.User["content"]]
      | [ConversationId, Message.User["content"]]
  ): RpcResultPromise<
    Conversation,
    | CannotCreateInferenceService
    | ConversationNotFound
    | CannotContinueConversation
  > {
    let inferenceService: InferenceService;
    try {
      inferenceService = await this.getInferenceService();
    } catch {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CannotCreateInferenceService", null),
      );
    }

    const { data: collections } = await this.sub(CollectionsList).exec();
    if (!collections) {
      throw new UnexpectedAssistantError("Getting collections failed.");
    }

    const now = new Date();

    let conversation: ConversationEntity | null;
    let userMessageContent: Message.User["content"];
    const contextFingerprint =
      await getConversationContextFingerprint(collections);
    if (args.length === 3) {
      userMessageContent = args[2];
      const [assistantName, format] = args;
      conversation = {
        id: Id.generate.conversation(),
        format: format,
        assistant: assistantName,
        title: userMessageContent[0].text,
        contextFingerprint: contextFingerprint,
        messages: [],
        isCompleted: false,
        createdAt: now,
      };
    } else {
      userMessageContent = args[1];
      const conversationId = args[0];
      conversation = await this.repos.conversation.find(conversationId);
      if (!conversation) {
        return makeUnsuccessfulRpcResult(
          makeRpcError("ConversationNotFound", { conversationId }),
        );
      }

      if (
        conversation.isCompleted ||
        conversation.contextFingerprint !== contextFingerprint
      ) {
        return makeUnsuccessfulRpcResult(
          makeRpcError("CannotContinueConversation", {
            conversationId: conversationId,
            reason: conversation.isCompleted
              ? "ConversationCompleted"
              : "ConversationContextChanged",
          }),
        );
      }
    }

    const assistant = this.createAssistant(
      conversation.assistant,
      inferenceService,
      collections,
    );

    const userMessage: Message.User = {
      role: MessageRole.User,
      content: userMessageContent,
      createdAt: new Date(),
    };
    const { hasCompletedConversation, messages } =
      await assistant.generateAndProcessNextMessages(conversation.format, [
        ...conversation.messages,
        userMessage,
      ]);

    const updatedConversation: ConversationEntity = {
      ...conversation,
      isCompleted: hasCompletedConversation,
      messages: messages,
    };
    await this.repos.conversation.upsert(updatedConversation);

    return makeSuccessfulRpcResult(makeConversation(updatedConversation));
  }

  private async getInferenceService(): Promise<InferenceService> {
    const globalSettings = await this.repos.globalSettings.get();
    return this.inferenceServiceFactory.create(globalSettings.assistant);
  }

  private createAssistant(
    assistantName: AssistantName,
    inferenceService: InferenceService,
    collections: Collection[],
  ): Assistant {
    switch (assistantName) {
      case AssistantName.DocumentCreator: {
        return new DocumentCreator(inferenceService, collections, {
          documentsCreate: this.sub(DocumentsCreate),
        });
      }
    }
  }
}
