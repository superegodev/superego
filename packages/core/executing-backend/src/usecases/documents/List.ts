import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  Document,
  DocumentId,
  LiteDocument,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type DocumentVersionEntity from "../../entities/DocumentVersionEntity.js";
import makeDocument from "../../makers/makeDocument.js";
import makeLiteDocument from "../../makers/makeLiteDocument.js";
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
  ): ResultPromise<LiteDocument[], CollectionNotFound | UnexpectedError>;
  async exec(
    collectionId: CollectionId,
    lite: false,
  ): ResultPromise<Document[], CollectionNotFound | UnexpectedError>;
  async exec(
    collectionId: CollectionId,
    lite = true,
  ): ResultPromise<
    (LiteDocument | Document)[],
    CollectionNotFound | UnexpectedError
  > {
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
        documents.map(async (documentEntity) => {
          const latestVersion = latestVersionsByDocumentId.get(
            documentEntity.id,
          );
          assertDocumentVersionExists(
            documentEntity.collectionId,
            documentEntity.id,
            latestVersion,
          );
          assertDocumentVersionMatchesCollectionVersion(
            documentEntity.collectionId,
            latestCollectionVersion,
            documentEntity.id,
            latestVersion,
          );
          const document = await makeDocument(
            this.javascriptSandbox,
            latestCollectionVersion,
            documentEntity,
            latestVersion,
          );
          return lite ? makeLiteDocument(document) : document;
        }),
      ),
    );
  }
}
