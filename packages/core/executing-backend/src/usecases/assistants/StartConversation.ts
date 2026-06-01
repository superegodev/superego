import {
  AssistantName as AssistantNameEnum,
  type AssistantName,
  type Backend,
  BackgroundJobName,
  type Conversation,
  type FilesNotFound,
  type InferenceOptions,
  type InferenceOptionsNotValid,
  type Message,
  type MessageContentPart,
  MessageRole,
  type NonEmptyArray,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  validateInferenceOptions,
} from "@superego/shared-utils";
import * as v from "valibot";
import type FileEntity from "../../entities/FileEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import difference from "../../utils/difference.js";
import isEmpty from "../../utils/isEmpty.js";
import MessageContentFileUtils from "../../utils/MessageContentFileUtils.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsStartConversation extends BackendUsecase<
  Backend["assistants"]["startConversation"]
> {
  argumentsSchema = v.tuple([
    v.picklist(Object.values(AssistantNameEnum)),
    structuralSchemas.backend.types.userMessageContent(),
    structuralSchemas.backend.types.inferenceOptions("completion"),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.conversation(),
    [
      structuralSchemas.backend.errors.filesNotFound(),
      structuralSchemas.backend.errors.inferenceOptionsNotValid(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    assistant: AssistantName,
    userMessageContent: Message.User["content"],
    inferenceOptions: InferenceOptions<"completion">,
  ): ResultPromise<
    Conversation,
    FilesNotFound | InferenceOptionsNotValid | UnexpectedError
  > {
    const globalSettings = await this.repos.globalSettings.get();

    const inferenceOptionsIssues = validateInferenceOptions(
      inferenceOptions,
      globalSettings.inference,
    );
    if (!isEmpty(inferenceOptionsIssues)) {
      return makeUnsuccessfulResult(
        makeResultError("InferenceOptionsNotValid", {
          issues: inferenceOptionsIssues,
        }),
      );
    }

    const referencedFileIds =
      MessageContentFileUtils.extractReferencedFileIds(userMessageContent);
    const referencedFiles =
      await this.repos.file.findAllWhereIdIn(referencedFileIds);
    const missingFileIds = difference(
      referencedFileIds,
      referencedFiles.map(({ id }) => id),
    );
    if (!isEmpty(missingFileIds)) {
      return makeUnsuccessfulResult(
        makeResultError("FilesNotFound", { fileIds: missingFileIds }),
      );
    }

    const { data: collections } = await this.sub(CollectionsList).exec(false);
    if (!collections) {
      throw new UnexpectedAssistantError("Getting collections failed.");
    }
    const contextFingerprint =
      await ConversationUtils.getContextFingerprint(collections);

    const now = new Date();
    const { protoFilesWithIds, convertedMessageContent } =
      MessageContentFileUtils.extractAndConvertProtoFiles(userMessageContent);
    const userMessage: Message.User = {
      id: Id.generate.message(),
      role: MessageRole.User,
      content: convertedMessageContent as NonEmptyArray<MessageContentPart>,
      createdAt: now,
    };
    const conversationId = Id.generate.conversation();
    const conversationReference: FileEntity.ConversationReference = {
      conversationId,
    };
    const filesWithContent: (FileEntity & {
      content: Uint8Array<ArrayBuffer>;
    })[] = protoFilesWithIds.map((protoFileWithId) => ({
      id: protoFileWithId.id,
      referencedBy: [conversationReference],
      createdAt: now,
      content: protoFileWithId.content,
    }));

    await this.repos.conversation.create({
      id: conversationId,
      assistant,
      contextFingerprint,
      createdAt: now,
    });
    const userMessageNodeId = await this.repos.conversation.appendMessage(
      conversationId,
      null,
      userMessage,
    );
    await this.repos.conversation.markProcessingStarted(
      conversationId,
      userMessageNodeId,
      now,
    );
    await this.repos.file.insertAll(filesWithContent);
    await this.repos.file.addReferenceToAll(
      referencedFileIds,
      conversationReference,
    );

    await this.enqueueBackgroundJob({
      name: BackgroundJobName.ProcessConversation,
      input: { id: conversationId, inferenceOptions },
    });

    const conversation = await this.repos.conversation.find(conversationId);
    if (!conversation) {
      throw new UnexpectedAssistantError("Created conversation not found.");
    }
    return makeSuccessfulResult(
      makeConversation(conversation, contextFingerprint),
    );
  }
}
