import {
  AssistantName,
  type Backend,
  BackgroundJobName,
  type Conversation,
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
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import type ConversationEntity from "../../entities/ConversationEntity.js";
import type FileEntity from "../../entities/FileEntity.js";
import UnexpectedAssistantError from "../../errors/UnexpectedAssistantError.js";
import makeConversation from "../../makers/makeConversation.js";
import makeResultError from "../../makers/makeResultError.js";
import * as argSchemas from "../../utils/argSchemas.js";
import ConversationUtils from "../../utils/ConversationUtils.js";
import difference from "../../utils/difference.js";
import isEmpty from "../../utils/isEmpty.js";
import MessageContentFileUtils from "../../utils/MessageContentFileUtils.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";
import CollectionsList from "../collections/List.js";

export default class AssistantsStartConversation extends Usecase<
  Backend["assistants"]["startConversation"]
> {
  @validateArgs([
    v.enum(AssistantName),
    argSchemas.nonEmptyArray(argSchemas.messageContentPart()),
  ])
  async exec(
    assistant: AssistantName,
    userMessageContent: Message.User["content"],
  ): ResultPromise<Conversation, FilesNotFound | UnexpectedError> {
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

    const { data: collections } = await this.sub(CollectionsList).exec();
    if (!collections) {
      throw new UnexpectedAssistantError("Getting collections failed.");
    }
    const contextFingerprint =
      await ConversationUtils.getContextFingerprint(collections);

    const now = new Date();
    const { protoFilesWithIds, convertedMessageContent } =
      MessageContentFileUtils.extractAndConvertProtoFiles(userMessageContent);
    const userMessage: Message.User = {
      role: MessageRole.User,
      content: convertedMessageContent as NonEmptyArray<MessageContentPart>,
      createdAt: now,
    };
    const conversation: ConversationEntity = {
      id: Id.generate.conversation(),
      assistant: assistant,
      title: null,
      contextFingerprint: contextFingerprint,
      messages: [userMessage],
      status: ConversationStatus.Processing,
      error: null,
      createdAt: now,
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

    await this.repos.conversation.upsert(conversation);
    await this.repos.file.insertAll(filesWithContent);
    await this.repos.file.addReferenceToAll(
      referencedFileIds,
      conversationReference,
    );

    await this.enqueueBackgroundJob({
      name: BackgroundJobName.ProcessConversation,
      input: { id: conversation.id },
    });

    return makeSuccessfulResult(
      makeConversation(conversation, contextFingerprint),
    );
  }
}
