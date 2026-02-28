import {
  AssistantName,
  type CannotTranscribeAudioMessage,
  type Collection,
  type CollectionCategory,
  type ConversationId,
  type ConversationNotFound,
  ConversationStatus,
  type ConversationStatusNotProcessing,
  type GlobalSettings,
  type InferenceOptions,
  type InferenceOptionsNotValid,
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
  inferenceOptionsHas,
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
import validateInferenceOptions from "../../validators/validateInferenceOptions.js";
import CollectionCategoriesList from "../collection-categories/List.js";
import CollectionsCreateMany from "../collections/CreateMany.js";
import CollectionsList from "../collections/List.js";
import DocumentsCreateMany from "../documents/CreateMany.js";
import DocumentsCreateNewVersion from "../documents/CreateNewVersion.js";
import DocumentsList from "../documents/List.js";
import DocumentsSearch from "../documents/Search.js";
import FilesGetContent from "../files/GetContent.js";
import InferenceImplementTypescriptModule from "../inference/ImplementTypescriptModule.js";

export default class AssistantsProcessConversation extends Usecase {
  async exec({
    id,
    inferenceOptions,
  }: {
    id: ConversationId;
    inferenceOptions: InferenceOptions<"completion">;
  }): ResultPromise<
    null,
    | CannotTranscribeAudioMessage
    | ConversationNotFound
    | ConversationStatusNotProcessing
    | InferenceOptionsNotValid
    | UnexpectedError
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

    const globalSettings = await this.repos.globalSettings.get();

    const inferenceOptionsNotValid = validateInferenceOptions(
      inferenceOptions,
      globalSettings.inference,
    );
    if (inferenceOptionsNotValid) {
      return makeUnsuccessfulResult(inferenceOptionsNotValid);
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

      const { data: transcribedMessages, error: cannotTranscribeAudioMessage } =
        await this.transcribeLastUserMessage(
          inferenceService,
          conversation,
          inferenceOptions,
        );
      if (cannotTranscribeAudioMessage) {
        return makeUnsuccessfulResult(cannotTranscribeAudioMessage);
      }

      const [messages, title] = await Promise.all([
        assistant.generateAndProcessNextMessages(
          transcribedMessages,
          globalSettings.inference,
          inferenceOptions,
        ),
        conversation.title === null
          ? generateTitle(
              inferenceService,
              transcribedMessages.find(
                (message) => message.role === MessageRole.User,
              )!,
              inferenceOptions,
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
            documentsCreateMany: this.sub(DocumentsCreateMany),
            documentsList: this.sub(DocumentsList),
            documentsCreateNewVersion: this.sub(DocumentsCreateNewVersion),
            documentsSearch: this.sub(DocumentsSearch),
            filesGetContent: this.sub(FilesGetContent),
          },
          this.javascriptSandbox,
          this.typescriptCompiler,
          {
            create: () => this.repos.createSavepoint(),
            rollbackTo: (name: string) => this.repos.rollbackToSavepoint(name),
          },
        )
      : new CollectionCreatorAssistant(
          globalSettings.assistants.developerPrompts[
            AssistantName.CollectionCreator
          ],
          inferenceService,
          collectionCategories,
          collections,
          {
            collectionsCreateMany: this.sub(CollectionsCreateMany),
            filesGetContent: this.sub(FilesGetContent),
            inferenceImplementTypescriptModule: this.sub(
              InferenceImplementTypescriptModule,
            ),
          },
        );
  }

  private async transcribeLastUserMessage(
    inferenceService: InferenceService,
    conversation: ConversationEntity,
    inferenceOptions: InferenceOptions<"completion">,
  ): ResultPromise<Message[], CannotTranscribeAudioMessage> {
    const otherMessages = [...conversation.messages];
    const lastMessage = otherMessages.pop();

    // Skip transcription if there is no last user message or if it already
    // contains text (i.e. it was typed, or it was already transcribed).
    if (
      !lastMessage ||
      lastMessage.role !== MessageRole.User ||
      lastMessage.content.some(
        (part) => part.type === MessageContentPartType.Text,
      )
    ) {
      return makeSuccessfulResult(conversation.messages);
    }

    if (!inferenceOptionsHas(inferenceOptions, "transcription")) {
      return makeUnsuccessfulResult(
        makeResultError("CannotTranscribeAudioMessage", {
          conversationId: conversation.id,
        }),
      );
    }

    return makeSuccessfulResult([
      ...otherMessages,
      {
        ...lastMessage,
        content: (await pMap(lastMessage.content, async (part) =>
          part.type === MessageContentPartType.Audio
            ? {
                type: MessageContentPartType.Text,
                text: await inferenceService.stt(part.audio, inferenceOptions),
                audio: part.audio,
              }
            : part,
        )) as NonEmptyArray<MessageContentPart>,
      },
    ]);
  }
}
