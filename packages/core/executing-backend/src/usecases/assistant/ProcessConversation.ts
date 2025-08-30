import type { Collection, ConversationId } from "@superego/backend";
import type Assistant from "../../assistants/Assistant.js";
import DocumentCreator from "../../assistants/DocumentCreator/DocumentCreator.js";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import type InferenceService from "../../requirements/InferenceService.js";
import getConversationContextFingerprint from "../../utils/getConversationContextFingerprint.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";
import DocumentsCreate from "../documents/Create.js";

export default class AssistantProcessConversation extends Usecase {
  async exec(id: ConversationId): Promise<void> {
    const inferenceService = await this.getInferenceService();

    const { data: collections } = await this.sub(CollectionsList).exec();
    if (!collections) {
      throw new UnexpectedAssistantError("Getting collections failed.");
    }

    const contextFingerprint =
      await getConversationContextFingerprint(collections);
    const conversation = await this.repos.conversation.find(id);
    if (!conversation) {
      throw new Error("ConversationNotFound");
    }

    // TODO: also check status
    if (conversation.contextFingerprint !== contextFingerprint) {
      throw new Error("TODO");
    }

    const assistant = this.createAssistant(inferenceService, collections);

    const { messages } = await assistant.generateAndProcessNextMessages(
      conversation.format,
      conversation.messages,
    );

    const updatedConversation: ConversationEntity = {
      ...conversation,
      messages: messages,
    };
    await this.repos.conversation.upsert(updatedConversation);
  }

  private async getInferenceService(): Promise<InferenceService> {
    const globalSettings = await this.repos.globalSettings.get();
    return this.inferenceServiceFactory.create(globalSettings.inference);
  }

  private createAssistant(
    inferenceService: InferenceService,
    collections: Collection[],
  ): Assistant {
    return new DocumentCreator(inferenceService, collections, {
      documentsCreate: this.sub(DocumentsCreate),
    });
  }
}
