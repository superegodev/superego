import {
  type Backend,
  type CollectionId,
  type CollectionNotFound,
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
import assertCollectionRemoteConnectorExists from "../../utils/assertCollectionRemoteConnectorExists.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import ContentFileUtils from "../../utils/ContentFileUtils.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";

type ExecReturnValue = ResultPromise<
  Document,
  CollectionNotFound | DocumentContentNotValid | FilesNotFound | UnexpectedError
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
        },
  ): ExecReturnValue;
  async exec(
    collectionId: CollectionId,
    content: any,
    options?: {
      createdBy:
        | DocumentVersionCreator.Assistant
        | DocumentVersionCreator.Connector;
      conversationId?: ConversationId | null;
      remoteId?: string | null;
      remoteVersionId?: string | null;
    },
  ): ExecReturnValue {
    const collection = await this.repos.collection.find(collectionId);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId }),
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

    let remoteId = options?.remoteId ?? null;
    let remoteVersionId = options?.remoteVersionId ?? null;
    const { protoFilesWithIds, convertedContent } =
      ContentFileUtils.extractAndConvertProtoFiles(
        latestCollectionVersion.schema,
        contentValidationResult.output,
      );

    if (
      options?.createdBy !== DocumentVersionCreator.Connector &&
      collection.remote &&
      latestCollectionVersion.remoteConverters?.toProtoRemoteDocument
    ) {
      const connector = this.getConnector(collection);
      assertCollectionRemoteConnectorExists(
        collection.id,
        collection.remote.connector.name,
        connector,
      );
      // TODO: assert function
      if (!connector.createRemoteDocument) {
        throw new Error("TODO Should have createRemoteDocument");
      }

      const protoRemoteDocumentResult =
        await this.javascriptSandbox.executeSyncFunction(
          latestCollectionVersion.remoteConverters.toProtoRemoteDocument,
          [convertedContent],
        );
      if (!protoRemoteDocumentResult.success) {
        // TODO: custom error
        return makeUnsuccessfulResult(
          makeResultError("UnexpectedError", {
            cause: protoRemoteDocumentResult.error,
          }),
        );
      }
      const createRemoteDocumentParams = {
        authenticationSettings:
          collection.remote.connector.authenticationSettings,
        authenticationState: collection.remote.connectorAuthenticationState,
        settings: collection.remote.connector.settings,
        protoRemoteDocument: protoRemoteDocumentResult.data,
      };
      const createRemoteDocumentResult = await connector
        // TODO: explanation
        // @ts-expect-error
        .createRemoteDocument(createRemoteDocumentParams)
        // Handle case in which the connector throws instead of returning an
        // unsuccessful Result. (It should always return a Result, but bugs
        // lurk.)
        .catch((error) =>
          makeUnsuccessfulResult(makeResultError("UnexpectedError", error)),
        );
      if (!createRemoteDocumentResult.success) {
        // TODO: custom error
        return makeUnsuccessfulResult(
          makeResultError("UnexpectedError", {
            cause: createRemoteDocumentResult.error,
          }),
        );
      }
      remoteId = createRemoteDocumentResult.data.createdDocument.id;
      remoteVersionId =
        createRemoteDocumentResult.data.createdDocument.versionId;
    }

    const now = new Date();
    const createdBy = options?.createdBy ?? DocumentVersionCreator.User;
    const conversationId = options?.conversationId ?? null;
    const document: DocumentEntity = {
      id: Id.generate.document(),
      remoteId: remoteId,
      collectionId: collectionId,
      createdAt: now,
    };

    const documentVersion: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      remoteId: remoteVersionId,
      previousVersionId: null,
      documentId: document.id,
      collectionId: collectionId,
      collectionVersionId: latestCollectionVersion.id,
      conversationId: conversationId,
      content: convertedContent,
      createdBy: createdBy,
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
