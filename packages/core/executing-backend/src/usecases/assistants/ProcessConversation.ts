import {
  AssistantName,
  type CannotTranscribeAudioMessage,
  type Collection,
  type CollectionCategory,
  type Conversation,
  type ConversationId,
  type ConversationNodeId,
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
  validateInferenceOptions,
} from "@superego/shared-utils";
import pMap from "p-map";
import type Assistant from "../../assistants/Assistant.js";
import CollectionCreatorAssistant from "../../assistants/CollectionCreatorAssistant/CollectionCreatorAssistant.js";
import FactotumAssistant from "../../assistants/FactotumAssistant/FactotumAssistant.js";
import makeResultError from "../../makers/makeResultError.js";
import type InferenceService from "../../requirements/InferenceService.js";
import ConversationTextUtils from "../../utils/ConversationTextUtils.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import generateTitle from "../../utils/generateTitle.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";
import CollectionCategoriesList from "../collection-categories/List.js";
import CollectionsCreateMany from "../collections/CreateMany.js";
import CollectionsGetTypescriptSchema from "../collections/GetTypescriptSchema.js";
import CollectionsList from "../collections/List.js";
import DocumentsCreateMany from "../documents/CreateMany.js";
import DocumentsCreateNewVersion from "../documents/CreateNewVersion.js";
import DocumentsExecuteTypescriptFunction from "../documents/ExecuteTypescriptFunction.js";
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
    const collectionsListResult = await this.sub(CollectionsList).exec(false);
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

    const activeBranchMessages = ConversationUtils.getActiveBranchMessages(
      conversation.nodes,
      conversation.activeNodeId,
    );
    const onMessagesUpdated = (messages: Message[]) =>
      this.liveConversationStore.set(id, {
        ...this.makeLiveConversation(conversation, messages),
        hasOutdatedContext: false,
        canRetryLastResponse: false,
        status: ConversationStatus.Processing,
        processingStartedAt: conversation.processingStartedAt,
        error: null,
      });

    // Set initial live state with the current messages (before generation).
    onMessagesUpdated(activeBranchMessages);

    const beforeGenerateAndProcessSavepoint =
      await this.repos.createSavepoint();
    try {
      const inferenceOptionsIssues = validateInferenceOptions(
        inferenceOptions,
        globalSettings.inference,
      );
      if (!isEmpty(inferenceOptionsIssues)) {
        throw makeResultError("InferenceOptionsNotValid", {
          issues: inferenceOptionsIssues,
        });
      }

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
          conversation.id,
          activeBranchMessages,
          inferenceOptions,
        );
      if (cannotTranscribeAudioMessage) {
        throw cannotTranscribeAudioMessage;
      }
      if (transcribedMessages !== activeBranchMessages) {
        const lastUserNode = ConversationUtils.findLastUserNode(
          conversation.nodes,
          conversation.activeNodeId,
        );
        const transcribedLastUserMessage = transcribedMessages.findLast(
          (message) => message.role === MessageRole.User,
        );
        if (lastUserNode && transcribedLastUserMessage) {
          await this.repos.conversation.updateMessage(
            conversation.id,
            lastUserNode.id,
            transcribedLastUserMessage,
          );
        }
      }

      const [messages, title] = await Promise.all([
        assistant.generateAndProcessNextMessages(
          transcribedMessages,
          globalSettings.inference,
          inferenceOptions,
          onMessagesUpdated,
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

      let previousNodeId = conversation.activeNodeId;
      for (const message of messages.slice(transcribedMessages.length)) {
        previousNodeId = await this.repos.conversation.appendMessage(
          conversation.id,
          previousNodeId,
          message,
        );
      }
      if (title !== null && title !== conversation.title) {
        await this.repos.conversation.setTitle(conversation.id, title);
      }
      await this.repos.conversation.markProcessingCompleted(conversation.id);
    } catch (error) {
      await this.repos.rollbackToSavepoint(beforeGenerateAndProcessSavepoint);
      await this.repos.conversation.markProcessingFailed(
        conversation.id,
        conversation.activeNodeId,
        makeResultError("UnexpectedError", {
          cause: extractErrorDetails(error),
        }),
      );
    } finally {
      this.liveConversationStore.delete(id);
    }

    const updatedConversation = await this.repos.conversation.find(id);
    if (!updatedConversation) {
      return makeUnsuccessfulResult(
        makeResultError("ConversationNotFound", { conversationId: id }),
      );
    }

    // Index Factotum conversations for search.
    if (updatedConversation.assistant === AssistantName.Factotum) {
      const textChunks = ConversationTextUtils.extractTextChunks(
        updatedConversation.title,
        updatedConversation.nodes.flatMap((node) =>
          node.type === "Message" ? [node.message] : [],
        ),
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
          globalSettings.assistants.userInfo,
          globalSettings.assistants.userPreferences,
          globalSettings.assistants.developerPrompts[AssistantName.Factotum],
          inferenceService,
          collections,
          {
            documentsCreateMany: this.sub(DocumentsCreateMany),
            documentsList: this.sub(DocumentsList),
            documentsCreateNewVersion: this.sub(DocumentsCreateNewVersion),
            documentsExecuteTypescriptFunction: this.sub(
              DocumentsExecuteTypescriptFunction,
            ),
            documentsSearch: this.sub(DocumentsSearch),
            collectionsGetTypescriptSchema: this.sub(
              CollectionsGetTypescriptSchema,
            ),
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
    conversationId: ConversationId,
    messages: Message[],
    inferenceOptions: InferenceOptions<"completion">,
  ): ResultPromise<Message[], CannotTranscribeAudioMessage> {
    const otherMessages = [...messages];
    const lastMessage = otherMessages.pop();

    // Skip transcription if:
    if (
      // there is no last message, or the last message is not a user message
      !lastMessage ||
      lastMessage.role !== MessageRole.User ||
      // it already contains text (i.e. it was typed, or already transcribed)
      lastMessage.content.some(
        (part) => part.type === MessageContentPartType.Text,
      ) ||
      // it doesn't contain any audio to transcribe
      !lastMessage.content.some(
        (part) => part.type === MessageContentPartType.Audio,
      )
    ) {
      return makeSuccessfulResult(messages);
    }

    if (!inferenceOptionsHas(inferenceOptions, "transcription")) {
      return makeUnsuccessfulResult(
        makeResultError("CannotTranscribeAudioMessage", {
          conversationId,
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

  private makeLiveConversation(
    conversation: {
      id: ConversationId;
      assistant: AssistantName;
      title: string | null;
      createdAt: Date;
    },
    messages: Message[],
  ): Pick<
    Conversation,
    "id" | "assistant" | "title" | "nodes" | "activeNodeId" | "createdAt"
  > {
    let previousNodeId: ConversationNodeId | null = null;
    const nodes = messages.map((message, index) => {
      const id = `${conversation.id}:${index + 1}` as ConversationNodeId;
      const node = {
        type: "Message" as const,
        id,
        previousNodeId,
        message,
        createdAt: "createdAt" in message ? message.createdAt : new Date(),
      };
      previousNodeId = id;
      return node;
    });
    return {
      id: conversation.id,
      assistant: conversation.assistant,
      title: conversation.title,
      nodes,
      activeNodeId: previousNodeId,
      createdAt: conversation.createdAt,
    };
  }
}
