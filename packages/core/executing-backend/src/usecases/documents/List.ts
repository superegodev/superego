import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  Document,
  DocumentId,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type DocumentVersionEntity from "../../entities/DocumentVersionEntity.js";
import makeDocument from "../../makers/makeDocument.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import assertDocumentVersionMatchesCollectionVersion from "../../utils/assertDocumentVersionMatchesCollectionVersion.js";
import Usecase from "../../utils/Usecase.js";

export default class DocumentsList extends Usecase<
  Backend["documents"]["list"]
> {
  async exec(
    collectionId: CollectionId,
  ): ResultPromise<Document[], CollectionNotFound | UnexpectedError> {
    if (!(await this.repos.collection.exists(collectionId))) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId }),
      );
    }

    const latestCollectionVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(
        collectionId,
      );
    assertCollectionVersionExists(collectionId, latestCollectionVersion);

    const documents =
      await this.repos.document.findAllWhereCollectionIdEq(collectionId);
    const latestVersions =
      await this.repos.documentVersion.findAllLatestsWhereCollectionIdEq(
        collectionId,
      );
    const latestVersionsByDocumentId = new Map<
      DocumentId,
      DocumentVersionEntity
    >();
    latestVersions.forEach((latestVersion) => {
      latestVersionsByDocumentId.set(latestVersion.documentId, latestVersion);
    });

    return makeSuccessfulResult(
      await Promise.all(
        documents.map((document) => {
          const latestVersion = latestVersionsByDocumentId.get(document.id);
          assertDocumentVersionExists(
            document.collectionId,
            document.id,
            latestVersion,
          );
          assertDocumentVersionMatchesCollectionVersion(
            document.collectionId,
            latestCollectionVersion,
            document.id,
            latestVersion,
          );
          return makeDocument(
            this.javascriptSandbox,
            latestCollectionVersion,
            document,
            latestVersion,
          );
        }),
      ),
    );
  }
}
