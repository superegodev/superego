import {
  AssistantName,
  type Collection,
  type CollectionCategory,
  type ConversationId,
  type ConversationNotFound,
  ConversationStatus,
  type ConversationStatusNotProcessing,
  type GlobalSettings,
  type Message,
  type MessageContentPart,
  MessageContentPartType,
  MessageRole,
  type NonEmptyArray,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  extractErrorDetails,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import pMap from "p-map";
import type Assistant from "../../assistants/Assistant.js";
import CollectionCreatorAssistant from "../../assistants/CollectionCreatorAssistant/CollectionCreatorAssistant.js";
import FactotumAssistant from "../../assistants/FactotumAssistant/FactotumAssistant.js";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import makeResultError from "../../makers/makeResultError.js";
import type InferenceService from "../../requirements/InferenceService.js";
import ConversationTextUtils from "../../utils/ConversationTextUtils.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import generateTitle from "../../utils/generateTitle.js";
import Usecase from "../../utils/Usecase.js";
import CollectionCategoriesList from "../collection-categories/List.js";
import CollectionsCreate from "../collections/Create.js";
import CollectionsList from "../collections/List.js";
import DocumentsCreate from "../documents/Create.js";
import DocumentsCreateNewVersion from "../documents/CreateNewVersion.js";
import DocumentsList from "../documents/List.js";
import DocumentsSearch from "../documents/Search.js";
import FilesGetContent from "../files/GetContent.js";

export default class AssistantsProcessConversation extends Usecase {
  async exec({
    id,
  }: {
    id: ConversationId;
  }): ResultPromise<
    null,
    ConversationNotFound | ConversationStatusNotProcessing | UnexpectedError
  > {
    const collectionsListResult = await this.sub(CollectionsList).exec();
    if (!collectionsListResult.success) {
      return collectionsListResult;
    }
    const { data: collections } = collectionsListResult;

    const collectionCategoriesListResult = await this.sub(
      CollectionCategoriesList,
    ).exec();
    if (!collectionCategoriesListResult.success) {
      return collectionCategoriesListResult;
    }
    const { data: collectionCategories } = collectionCategoriesListResult;

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
        await ConversationUtils.getContextFingerprint(collections);
      if (conversation.contextFingerprint !== contextFingerprint) {
        throw new Error("Context fingerprint changed");
      }

      const globalSettings = await this.repos.globalSettings.get();
      const inferenceService = this.inferenceServiceFactory.create(
        globalSettings.inference,
      );
      const assistant = this.createAssistant(
        conversation.id,
        globalSettings,
        inferenceService,
        conversation.assistant,
        collectionCategories,
        collections,
      );

      const transcribedMessages = await this.transcribeLastUserMessage(
        inferenceService,
        conversation.messages,
      );

      const [messages, title] = await Promise.all([
        assistant.generateAndProcessNextMessages(transcribedMessages),
        conversation.title === null
          ? generateTitle(
              inferenceService,
              transcribedMessages.find(
                (message) => message.role === MessageRole.User,
              )!,
            )
          : conversation.title,
      ]);

      updatedConversation = {
        ...conversation,
        title: title,
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

    // Index Factotum conversations for search.
    if (updatedConversation.assistant === AssistantName.Factotum) {
      const textChunks = ConversationTextUtils.extractTextChunks(
        updatedConversation.title,
        updatedConversation.messages,
      );
      await this.repos.conversationTextSearchIndex.upsert(
        updatedConversation.id,
        textChunks,
      );
    }

    return makeSuccessfulResult(null);
  }

  private createAssistant(
    conversationId: ConversationId,
    globalSettings: GlobalSettings,
    inferenceService: InferenceService,
    assistant: AssistantName,
    collectionCategories: CollectionCategory[],
    collections: Collection[],
  ): Assistant {
    return assistant === AssistantName.Factotum
      ? new FactotumAssistant(
          conversationId,
          globalSettings.assistants.userName,
          globalSettings.assistants.developerPrompts[AssistantName.Factotum],
          inferenceService,
          collections,
          {
            documentsCreate: this.sub(DocumentsCreate),
            documentsList: this.sub(DocumentsList),
            documentsCreateNewVersion: this.sub(DocumentsCreateNewVersion),
            documentsSearch: this.sub(DocumentsSearch),
            filesGetContent: this.sub(FilesGetContent),
          },
          this.javascriptSandbox,
          this.typescriptCompiler,
        )
      : new CollectionCreatorAssistant(
          globalSettings.assistants.developerPrompts[
            AssistantName.CollectionCreator
          ],
          inferenceService,
          collectionCategories,
          collections,
          {
            collectionsCreate: this.sub(CollectionsCreate),
            filesGetContent: this.sub(FilesGetContent),
          },
        );
  }

  private async transcribeLastUserMessage(
    inferenceService: InferenceService,
    messages: Message[],
  ): Promise<Message[]> {
    const otherMessages = [...messages];
    const lastMessage = otherMessages.pop();

    // There should always be a last message, it should always be a user message
    // and it should always not have been transcribed. Nonetheless, we check to
    // avoid transcribing unnecessarily.
    if (
      !lastMessage ||
      lastMessage.role !== MessageRole.User ||
      lastMessage.content.some(
        (part) => part.type === MessageContentPartType.Text,
      )
    ) {
      return messages;
    }

    return [
      ...otherMessages,
      {
        ...lastMessage,
        content: (await pMap(lastMessage.content, async (part) =>
          part.type === MessageContentPartType.Audio
            ? {
                type: MessageContentPartType.Text,
                text: await inferenceService.stt(part.audio),
                audio: part.audio,
              }
            : part,
        )) as NonEmptyArray<MessageContentPart>,
      },
    ];
  }
}
