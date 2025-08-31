import type {
  Backend,
  CollectionId,
  Document,
  DocumentContentNotValid,
  DocumentId,
  DocumentNotFound,
  DocumentVersionId,
  DocumentVersionIdNotMatching,
  FilesNotFound,
  UnexpectedError,
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

export default class DocumentsCreateNewVersion extends Usecase<
  Backend["documents"]["createNewVersion"]
> {
  async exec(
    collectionId: CollectionId,
    id: DocumentId,
    latestVersionId: DocumentVersionId,
    content: any,
  ): ResultPromise<
    Document,
    | DocumentNotFound
    | DocumentVersionIdNotMatching
    | DocumentContentNotValid
    | FilesNotFound
    | UnexpectedError
  > {
    const document = await this.repos.document.find(id);
    if (!document || document.collectionId !== collectionId) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentNotFound", { documentId: id }),
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
    const { convertedContent, protoFilesWithIds } =
      ContentFileUtils.extractAndConvertProtoFiles(
        latestCollectionVersion.schema,
        contentValidationResult.output,
      );
    const documentVersion: DocumentVersionEntity = {
      id: Id.generate.documentVersion(),
      previousVersionId: latestVersionId,
      documentId: id,
      collectionId: document.collectionId,
      collectionVersionId: latestCollectionVersion.id,
      content: convertedContent,
      createdAt: now,
    };
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
