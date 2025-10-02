import {
  type Backend,
  type CollectionId,
  type ConversationId,
  type Document,
  type DocumentContentNotValid,
  type DocumentId,
  type DocumentIsRemote,
  type DocumentNotFound,
  DocumentVersionCreator,
  type DocumentVersionId,
  type DocumentVersionIdNotMatching,
  type FilesNotFound,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { valibotSchemas } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import * as v from "valibot";
import type DocumentVersionEntity from "../../entities/DocumentVersionEntity.js";
import type FileEntity from "../../entities/FileEntity.js";
import makeDocument from "../../makers/makeDocument.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import ContentFileUtils from "../../utils/ContentFileUtils.js";
import difference from "../../utils/difference.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";

type ExecReturnValue = ResultPromise<
  Document,
  | DocumentNotFound
  | DocumentIsRemote
  | DocumentVersionIdNotMatching
  | DocumentContentNotValid
  | FilesNotFound
  | UnexpectedError
>;
export default class DocumentsCreateNewVersion extends Usecase<
  Backend["documents"]["createNewVersion"]
> {
  async exec(
    collectionId: CollectionId,
    id: DocumentId,
    latestVersionId: DocumentVersionId,
    content: any,
  ): ExecReturnValue;
  async exec(
    collectionId: CollectionId,
    id: DocumentId,
    latestVersionId: DocumentVersionId,
    content: any,
    options:
      | {
          createdBy: DocumentVersionCreator.Assistant;
          conversationId: ConversationId;
        }
      | {
          createdBy: DocumentVersionCreator.Migration;
          remoteId: string | null;
        }
      | {
          createdBy: DocumentVersionCreator.Connector;
          remoteId: string;
        },
  ): ExecReturnValue;
  async exec(
    collectionId: CollectionId,
    id: DocumentId,
    latestVersionId: DocumentVersionId,
    content: any,
    options?: {
      createdBy:
        | DocumentVersionCreator.Assistant
        | DocumentVersionCreator.Migration
        | DocumentVersionCreator.Connector;
      conversationId?: ConversationId;
      remoteId?: string | null;
    },
  ): ExecReturnValue {
    const document = await this.repos.document.find(id);
    if (!document || document.collectionId !== collectionId) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentNotFound", { documentId: id }),
      );
    }

    if (
      document.remoteId &&
      options?.createdBy !== DocumentVersionCreator.Connector &&
      options?.createdBy !== DocumentVersionCreator.Migration
    ) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentIsRemote", {
          documentId: id,
          message:
            "Remote documents are read-only. You can't create new versions or delete them.",
        }),
      );
    }

    const latestVersion =
      await this.repos.documentVersion.findLatestWhereDocumentIdEq(id);
    assertDocumentVersionExists(document.collectionId, id, latestVersion);

    if (latestVersionId !== latestVersion.id) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentVersionIdNotMatching", {
          documentId: id,
          latestVersionId: latestVersion.id,
          suppliedVersionId: latestVersionId,
        }),
      );
    }

    const latestCollectionVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(
        document.collectionId,
      );
    assertCollectionVersionExists(
      document.collectionId,
      latestCollectionVersion,
    );

    const contentValidationResult = v.safeParse(
      valibotSchemas.content(latestCollectionVersion.schema),
      content,
    );
    if (!contentValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentContentNotValid", {
          collectionId: document.collectionId,
          collectionVersionId: latestCollectionVersion.id,
          documentId: id,
          issues: makeValidationIssues(contentValidationResult.issues),
        }),
      );
    }

    const referencedFileIds = ContentFileUtils.extractReferencedFileIds(
      latestCollectionVersion.schema,
      contentValidationResult.output,
    );
    const referencedFiles =
      await this.repos.file.findAllWhereIdIn(referencedFileIds);
    // Extraneous files are files that exist, but they were not created for this
    // document.
    const extraneousFileIds = referencedFiles
      .filter(({ documentId }) => documentId !== id)
      .map(({ id }) => id);
    const missingFileIds = difference(
      referencedFileIds,
      referencedFiles.map(({ id }) => id),
    );
    if (!isEmpty(extraneousFileIds) || !isEmpty(missingFileIds)) {
      return makeUnsuccessfulResult(
        makeResultError("FilesNotFound", {
          collectionId: document.collectionId,
          documentId: id,
          fileIds: [...extraneousFileIds, ...missingFileIds],
        }),
      );
    }

    const now = new Date();
    const createdBy = options?.createdBy ?? DocumentVersionCreator.User;
    const conversationId = options?.conversationId ?? null;
    const remoteId = options?.remoteId ?? null;
    const { convertedContent, protoFilesWithIds } =
      ContentFileUtils.extractAndConvertProtoFiles(
        latestCollectionVersion.schema,
        contentValidationResult.output,
      );
    const documentVersion: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      remoteId: remoteId,
      previousVersionId: latestVersionId,
      documentId: id,
      collectionId: document.collectionId,
      collectionVersionId: latestCollectionVersion.id,
      conversationId: conversationId,
      content: convertedContent,
      createdBy: createdBy,
      createdAt: now,
    } as DocumentVersionEntity;
    const filesWithContent: (FileEntity & {
      content: Uint8Array<ArrayBuffer>;
    })[] = protoFilesWithIds.map((protoFileWithId) => ({
      id: protoFileWithId.id,
      collectionId: document.collectionId,
      documentId: id,
      createdWithDocumentVersionId: documentVersion.id,
      createdAt: now,
      content: protoFileWithId.content,
    }));
    await this.repos.documentVersion.insert(documentVersion);
    await this.repos.file.insertAll(filesWithContent);

    return makeSuccessfulResult(
      await makeDocument(
        this.javascriptSandbox,
        latestCollectionVersion,
        document,
        documentVersion,
      ),
    );
  }
}
