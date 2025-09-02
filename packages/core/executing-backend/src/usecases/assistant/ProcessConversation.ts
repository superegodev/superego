import {
  type CannotProcessConversation,
  type Collection,
  type ConversationId,
  type ConversationNotFound,
  ConversationStatus,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type Assistant from "../../assistant/Assistant.js";
import DocumentCreator from "../../assistant/DocumentCreator/DocumentCreator.js";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import type InferenceService from "../../requirements/InferenceService.js";
import getConversationContextFingerprint from "../../utils/getConversationContextFingerprint.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";
import DocumentsCreate from "../documents/Create.js";

export default class AssistantProcessConversation extends Usecase {
  async exec({
    id,
  }: {
    id: ConversationId;
  }): ResultPromise<
    void,
    ConversationNotFound | CannotProcessConversation | UnexpectedError
  > {
    const inferenceService = await this.getInferenceService();

    const collectionsListResult = await this.sub(CollectionsList).exec();
    if (!collectionsListResult.success) {
      return collectionsListResult;
    }
    const { data: collections } = collectionsListResult;

    const conversation = await this.repos.conversation.find(id);
    if (!conversation) {
      return makeUnsuccessfulResult(
        makeResultError("ConversationNotFound", { conversationId: id }),
      );
    }

    const contextFingerprint =
      await getConversationContextFingerprint(collections);
    if (
      conversation.contextFingerprint !== contextFingerprint ||
      conversation.status !== ConversationStatus.Processing
    ) {
      return makeUnsuccessfulResult(
        makeResultError("CannotProcessConversation", {
          conversationId: id,
          reason:
            conversation.status !== ConversationStatus.Processing
              ? "ConversationStatusNotProcessing"
              : "ConversationContextChanged",
        }),
      );
    }

    const assistant = this.createAssistant(inferenceService, collections);

    const { messages } = await assistant.generateAndProcessNextMessages(
      conversation.format,
      conversation.messages,
    );

    // TODO: handle error case. Probably requires savepoint.
    const updatedConversation: ConversationEntity = {
      ...conversation,
      status: ConversationStatus.Idle,
      messages: messages,
    };
    await this.repos.conversation.upsert(updatedConversation);

    return makeSuccessfulResult(undefined);
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
