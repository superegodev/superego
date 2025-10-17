import {
  type Backend,
  type CollectionId,
  type CollectionNotFound,
  type ConnectorDoesNotSupportUpSyncing,
  type ConversationId,
  type Document,
  type DocumentContentNotValid,
  DocumentVersionCreator,
  type FilesNotFound,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { valibotSchemas } from "@superego/schema";
import {
  Id,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import type DocumentEntity from "../../entities/DocumentEntity.js";
import type DocumentVersionEntity from "../../entities/DocumentVersionEntity.js";
import type FileEntity from "../../entities/FileEntity.js";
import makeDocument from "../../makers/makeDocument.js";
import makeResultError from "../../makers/makeResultError.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import ContentFileUtils from "../../utils/ContentFileUtils.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";

type ExecReturnValue = ResultPromise<
  Document,
  | CollectionNotFound
  | ConnectorDoesNotSupportUpSyncing
  | DocumentContentNotValid
  | FilesNotFound
  | UnexpectedError
>;
export default class DocumentsCreate extends Usecase<
  Backend["documents"]["create"]
> {
  async exec(collectionId: CollectionId, content: any): ExecReturnValue;
  async exec(
    collectionId: CollectionId,
    content: any,
    options:
      | {
          createdBy: DocumentVersionCreator.Assistant;
          conversationId: ConversationId;
        }
      | {
          createdBy: DocumentVersionCreator.Connector;
          remoteId: string;
          remoteVersionId: string;
          remoteUrl: string | null;
          remoteDocument: any;
        },
  ): ExecReturnValue;
  async exec(
    collectionId: CollectionId,
    content: any,
    options?: {
      createdBy:
        | DocumentVersionCreator.Assistant
        | DocumentVersionCreator.Connector;
      conversationId?: ConversationId;
      remoteId?: string;
      remoteVersionId?: string;
      remoteUrl?: string | null;
      remoteDocument?: any;
    },
  ): ExecReturnValue {
    const collection = await this.repos.collection.find(collectionId);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId }),
      );
    }

    if (
      // Right now no connector supports up-syncing, so checking if the
      // collection has a remote is sufficient. TODO: update condition once
      // connectors support up-syncing.
      collection.remote !== null &&
      options?.createdBy !== DocumentVersionCreator.Connector
    ) {
      return makeUnsuccessfulResult(
        makeResultError("ConnectorDoesNotSupportUpSyncing", {
          collectionId: collectionId,
          connectorName: collection.remote.connector.name,
          message:
            "The collection has a remote, and its connector does not support up-syncing. This effectively makes the collection read-only.",
        }),
      );
    }

    const latestCollectionVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(
        collectionId,
      );
    assertCollectionVersionExists(collectionId, latestCollectionVersion);

    const contentValidationResult = v.safeParse(
      valibotSchemas.content(latestCollectionVersion.schema),
      content,
    );
    if (!contentValidationResult.success) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentContentNotValid", {
          collectionId,
          collectionVersionId: latestCollectionVersion.id,
          documentId: null,
          issues: makeValidationIssues(contentValidationResult.issues),
        }),
      );
    }

    // Files are always associated to a specific Document, so it's
    // impossible to reference existing Files when creating an Document.
    const referencedFileIds = ContentFileUtils.extractReferencedFileIds(
      latestCollectionVersion.schema,
      contentValidationResult.output,
    );
    if (!isEmpty(referencedFileIds)) {
      return makeUnsuccessfulResult(
        makeResultError("FilesNotFound", {
          collectionId,
          documentId: null,
          fileIds: referencedFileIds,
        }),
      );
    }

    const now = new Date();
    // TypeScript doesn't understand that if remoteId is not null all other
    // remote* properties are not null.
    // @ts-expect-error
    const document: DocumentEntity = {
      id: Id.generate.document(),
      remoteId: options?.remoteId ?? null,
      remoteUrl: options?.remoteUrl ?? null,
      latestRemoteDocument: options?.remoteDocument ?? null,
      collectionId: collectionId,
      createdAt: now,
    };
    const { protoFilesWithIds, convertedContent } =
      ContentFileUtils.extractAndConvertProtoFiles(
        latestCollectionVersion.schema,
        contentValidationResult.output,
      );
    const documentVersion: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      remoteId: options?.remoteVersionId ?? null,
      previousVersionId: null,
      documentId: document.id,
      collectionId: collectionId,
      collectionVersionId: latestCollectionVersion.id,
      conversationId: options?.conversationId ?? null,
      content: convertedContent,
      createdBy: options?.createdBy ?? DocumentVersionCreator.User,
      createdAt: now,
    };
    const filesWithContent: (FileEntity & {
      content: Uint8Array<ArrayBuffer>;
    })[] = protoFilesWithIds.map((protoFileWithId) => ({
      id: protoFileWithId.id,
      collectionId: collectionId,
      documentId: document.id,
      createdWithDocumentVersionId: documentVersion.id,
      createdAt: now,
      content: protoFileWithId.content,
    }));
    await this.repos.document.insert(document);
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
