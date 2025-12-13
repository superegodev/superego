import {
  type Backend,
  BackgroundJobName,
  type CannotContinueConversation,
  type Conversation,
  type ConversationId,
  type ConversationNotFound,
  ConversationStatus,
  type FilesNotFound,
  type Message,
  type MessageContentPart,
  MessageRole,
  type NonEmptyArray,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import type FileEntity from "../../entities/FileEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeResultError from "../../makers/makeResultError.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import difference from "../../utils/difference.js";
import isEmpty from "../../utils/isEmpty.js";
import MessageContentFileUtils from "../../utils/MessageContentFileUtils.js";
import Usecase from "../../utils/Usecase.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsContinueConversation extends Usecase<
  Backend["assistants"]["continueConversation"]
> {
  async exec(
    id: ConversationId,
    userMessageContent: NonEmptyArray<MessageContentPart.Text>,
  ): ResultPromise<
    Conversation,
    | ConversationNotFound
    | CannotContinueConversation
    | FilesNotFound
    | UnexpectedError
  > {
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
      role: MessageRole.User,
      content: convertedMessageContent as NonEmptyArray<MessageContentPart>,
      createdAt: now,
    };
    const updatedConversation: ConversationEntity = {
      ...conversation,
      messages: [...conversation.messages, userMessage],
      status: ConversationStatus.Processing,
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
      input: { id },
    });

    return makeSuccessfulResult(
      makeConversation(updatedConversation, contextFingerprint),
    );
  }
}
