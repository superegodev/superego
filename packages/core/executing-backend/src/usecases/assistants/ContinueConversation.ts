import {
  type Backend,
  BackgroundJobName,
  type CannotContinueConversation,
  type Conversation,
  type ConversationId,
  type ConversationNotFound,
  ConversationStatus,
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
import type ConversationEntity from "../../entities/ConversationEntity.js";
import type FileEntity from "../../entities/FileEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeResultError from "../../makers/makeResultError.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import difference from "../../utils/difference.js";
import isEmpty from "../../utils/isEmpty.js";
import MessageContentFileUtils from "../../utils/MessageContentFileUtils.js";
import { conversation as conversationSchema } from "../../validation/domain/conversation.js";
import {
  cannotContinueConversation,
  conversationNotFound,
  filesNotFound,
  inferenceOptionsNotValid,
  unexpectedError,
} from "../../validation/errors.js";
import { conversationId } from "../../validation/helpers/idSchemas.js";
import looseObjectAs from "../../validation/helpers/looseObjectAs.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsContinueConversation extends BackendUsecase<
  Backend["assistants"]["continueConversation"]
> {
  argumentsSchema = v.tuple([
    conversationId(),
    v.array(v.unknown()) as unknown as v.GenericSchema<
      unknown,
      NonEmptyArray<MessageContentPart.Text>
    >,
    looseObjectAs<InferenceOptions<"completion">>(),
  ]);
  resultSchema = makeResultSchema(conversationSchema(), [
    cannotContinueConversation(),
    conversationNotFound(),
    filesNotFound(),
    inferenceOptionsNotValid(),
    unexpectedError(),
  ]);

  async exec(
    id: ConversationId,
    userMessageContent: NonEmptyArray<MessageContentPart.Text>,
    inferenceOptions: InferenceOptions<"completion">,
  ): ResultPromise<
    Conversation,
    | ConversationNotFound
    | CannotContinueConversation
    | FilesNotFound
    | InferenceOptionsNotValid
    | UnexpectedError
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

    const conversation = await this.repos.conversation.find(id);
    if (!conversation) {
      return makeUnsuccessfulResult(
        makeResultError("ConversationNotFound", { conversationId: id }),
      );
    }

    const { data: collections } = await this.sub(CollectionsList).exec();
    if (!collections) {
      throw new UnexpectedAssistantError("Getting collections failed.");
    }
    const contextFingerprint =
      await ConversationUtils.getContextFingerprint(collections);
    if (
      conversation.status !== ConversationStatus.Idle ||
      conversation.contextFingerprint !== contextFingerprint
    ) {
      return makeUnsuccessfulResult(
        makeResultError("CannotContinueConversation", {
          conversationId: id,
          reason:
            conversation.status === ConversationStatus.Processing
              ? "ConversationIsProcessing"
              : conversation.status === ConversationStatus.Error
                ? "ConversationHasError"
                : "ConversationHasOutdatedContext",
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

    const now = new Date();
    const { protoFilesWithIds, convertedMessageContent } =
      MessageContentFileUtils.extractAndConvertProtoFiles(userMessageContent);
    const userMessage: Message.User = {
      id: Id.generate.message(),
      role: MessageRole.User,
      content: convertedMessageContent as NonEmptyArray<MessageContentPart>,
      createdAt: now,
    };
    const updatedConversation: ConversationEntity = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      status: ConversationStatus.Processing,
      processingStartedAt: now,
    };
    const conversationReference: FileEntity.ConversationReference = {
      conversationId: conversation.id,
    };
    const filesWithContent: (FileEntity & {
      content: Uint8Array<ArrayBuffer>;
    })[] = protoFilesWithIds.map((protoFileWithId) => ({
      id: protoFileWithId.id,
      referencedBy: [conversationReference],
      createdAt: now,
      content: protoFileWithId.content,
    }));

    await this.repos.conversation.upsert(updatedConversation);
    await this.repos.file.insertAll(filesWithContent);
    await this.repos.file.addReferenceToAll(
      referencedFileIds,
      conversationReference,
    );

    await this.enqueueBackgroundJob({
      name: BackgroundJobName.ProcessConversation,
      input: { id, inferenceOptions },
    });

    return makeSuccessfulResult(
      makeConversation(updatedConversation, contextFingerprint),
    );
  }
}
