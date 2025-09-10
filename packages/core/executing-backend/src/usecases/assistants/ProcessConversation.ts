import {
  AssistantName,
  type Collection,
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
import { extractErrorDetails } from "@superego/shared-utils";
import type Assistant from "../../assistants/Assistant.js";
import CollectionManagerAssistant from "../../assistants/CollectionManagerAssistant/CollectionManagerAssistant.js";
import FactotumAssistant from "../../assistants/FactotumAssistant/FactotumAssistant.js";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import type InferenceService from "../../requirements/InferenceService.js";
import generateTitle from "../../utils/generateTitle.js";
import getConversationContextFingerprint from "../../utils/getConversationContextFingerprint.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";
import DocumentsCreate from "../documents/Create.js";
import DocumentsCreateNewVersion from "../documents/CreateNewVersion.js";
import DocumentsList from "../documents/List.js";

export default class AssistantsProcessConversation extends Usecase {
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

      const globalSettings = await this.repos.globalSettings.get();
      const inferenceService = this.inferenceServiceFactory.create(
        globalSettings.inference,
      );
      const assistant = this.createAssistant(
        globalSettings,
        inferenceService,
        conversation.assistant,
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

    return makeSuccessfulResult(undefined);
  }

  private createAssistant(
    globalSettings: GlobalSettings,
    inferenceService: InferenceService,
    assistant: AssistantName,
    collections: Collection[],
  ): Assistant {
    return assistant === AssistantName.Factotum
      ? new FactotumAssistant(
          globalSettings.assistants.userName,
          globalSettings.assistants.developerPrompts[AssistantName.Factotum],
          inferenceService,
          collections,
          {
            documentsCreate: this.sub(DocumentsCreate),
            documentsList: this.sub(DocumentsList),
            documentsCreateNewVersion: this.sub(DocumentsCreateNewVersion),
          },
          this.javascriptSandbox,
        )
      : new CollectionManagerAssistant(
          globalSettings.assistants.developerPrompts[
            AssistantName.CollectionManager
          ],
          inferenceService,
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
        content: (await Promise.all(
          lastMessage.content.map(async (part) =>
            part.type === MessageContentPartType.Audio
              ? {
                  type: MessageContentPartType.Text,
                  text: await inferenceService.stt(part.audio),
                  audio: part.audio,
                }
              : part,
          ),
        )) as NonEmptyArray<MessageContentPart>,
      },
    ];
  }
}
