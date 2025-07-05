import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  Document,
  DocumentContentNotValid,
  FilesNotFound,
  RpcResultPromise,
} from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import * as v from "valibot";
import type DocumentEntity from "../../entities/DocumentEntity.js";
import type DocumentVersionEntity from "../../entities/DocumentVersionEntity.js";
import type FileEntity from "../../entities/FileEntity.js";
import makeDocument from "../../makers/makeDocument.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import makeValidationIssues from "../../makers/makeValidationIssues.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import ContentFileUtils from "../../utils/ContentFileUtils.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";

export default class DocumentsCreate extends Usecase<
  Backend["documents"]["create"]
> {
  async exec(
    collectionId: CollectionId,
    content: any,
  ): RpcResultPromise<
    Document,
    CollectionNotFound | DocumentContentNotValid | FilesNotFound
  > {
    if (!(await this.repos.collection.exists(collectionId))) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionNotFound", { collectionId }),
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
      return makeUnsuccessfulRpcResult(
        makeRpcError("DocumentContentNotValid", {
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
      return makeUnsuccessfulRpcResult(
        makeRpcError("FilesNotFound", {
          collectionId,
          documentId: null,
          fileIds: referencedFileIds,
        }),
      );
    }

    const now = new Date();
    const document: DocumentEntity = {
      id: Id.generate.document(),
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
      previousVersionId: null,
      documentId: document.id,
      collectionId: collectionId,
      collectionVersionId: latestCollectionVersion.id,
      content: convertedContent,
      createdAt: now,
    };
    const filesWithContent: (FileEntity & { content: Uint8Array })[] =
      protoFilesWithIds.map((protoFileWithId) => ({
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

    return makeSuccessfulRpcResult(
      await makeDocument(
        this.javascriptSandbox,
        latestCollectionVersion,
        document,
        documentVersion,
      ),
    );
  }
}
