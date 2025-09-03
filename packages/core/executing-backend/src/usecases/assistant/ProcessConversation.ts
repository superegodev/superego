import {
  type Collection,
  type ConversationId,
  type ConversationNotFound,
  ConversationStatus,
  type ConversationStatusNotProcessing,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { extractErrorDetails } from "@superego/shared-utils";
import type Assistant from "../../assistant/Assistant.js";
import SinglePromptAssistant from "../../assistant/SinglePromptAssistant/SinglePromptAssistant.js";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import type InferenceService from "../../requirements/InferenceService.js";
import getConversationContextFingerprint from "../../utils/getConversationContextFingerprint.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";
import DocumentsCreate from "../documents/Create.js";
import DocumentsCreateNewVersion from "../documents/CreateNewVersion.js";
import DocumentsList from "../documents/List.js";

export default class AssistantProcessConversation extends Usecase {
  async exec({
    id,
  }: {
    id: ConversationId;
  }): ResultPromise<
    void,
    ConversationNotFound | ConversationStatusNotProcessing | UnexpectedError
  > {
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

    if (conversation.status !== ConversationStatus.Processing) {
      return makeUnsuccessfulResult(
        makeResultError("ConversationStatusNotProcessing", {
          conversationId: id,
        }),
      );
    }

    let updatedConversation: ConversationEntity;
    const beforeGenerateAndProcessSavepoint =
      await this.repos.createSavepoint();
    try {
      const contextFingerprint =
        await getConversationContextFingerprint(collections);
      if (conversation.contextFingerprint !== contextFingerprint) {
        throw new Error("Context fingerprint changed");
      }
      const inferenceService = await this.getInferenceService();
      const assistant = this.createAssistant(inferenceService, collections);
      const messages = await assistant.generateAndProcessNextMessages(
        conversation.format,
        conversation.messages,
      );
      updatedConversation = {
        ...conversation,
        status: ConversationStatus.Idle,
        messages: messages,
      };
    } catch (error) {
      await this.repos.rollbackToSavepoint(beforeGenerateAndProcessSavepoint);
      updatedConversation = {
        ...conversation,
        status: ConversationStatus.Error,
        error: makeResultError("UnexpectedError", {
          cause: extractErrorDetails(error),
        }),
      };
    }

    await this.repos.conversation.upsert(updatedConversation);

    return makeSuccessfulResult(undefined);
  }

  private async getInferenceService(): Promise<InferenceService> {
    const globalSettings = await this.repos.globalSettings.get();
    return this.inferenceServiceFactory.create(globalSettings.inference);
  }

  // TODO: consider making AssistantFactory requirement.
  private createAssistant(
    inferenceService: InferenceService,
    collections: Collection[],
  ): Assistant {
    return new SinglePromptAssistant(
      inferenceService,
      collections,
      {
        documentsCreate: this.sub(DocumentsCreate),
        documentsList: this.sub(DocumentsList),
        documentsCreateNewVersion: this.sub(DocumentsCreateNewVersion),
      },
      this.javascriptSandbox,
    );
  }
}
