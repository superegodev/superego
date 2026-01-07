import type {
  Backend,
  CollectionId,
  CollectionVersionId,
  DocumentId,
  DocumentNotFound,
  LiteDocumentVersion,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeContentSummary from "../../makers/makeContentSummary.js";
import makeLiteDocumentVersionFromEntity from "../../makers/makeLiteDocumentVersionFromEntity.js";
import makeResultError from "../../makers/makeResultError.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class DocumentsListVersions extends Usecase<
  Backend["documents"]["listVersions"]
> {
  async exec(
    collectionId: CollectionId,
    documentId: DocumentId,
  ): ResultPromise<LiteDocumentVersion[], DocumentNotFound | UnexpectedError> {
    const document = await this.repos.document.find(documentId);
    if (!document || document.collectionId !== collectionId) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentNotFound", { documentId }),
      );
    }

    const documentVersions =
      await this.repos.documentVersion.findAllWhereDocumentIdEq(documentId);

    // Group versions by collectionVersionId so we can batch content summary
    // computation per collection version
    const versionsByCollectionVersionId = new Map<
      CollectionVersionId,
      typeof documentVersions
    >();
    for (const version of documentVersions) {
      const group = versionsByCollectionVersionId.get(
        version.collectionVersionId,
      );
      if (group) {
        group.push(version);
      } else {
        versionsByCollectionVersionId.set(version.collectionVersionId, [
          version,
        ]);
      }
    }

    // Fetch all needed collection versions
    const collectionVersionsById = new Map<
      CollectionVersionId,
      CollectionVersionEntity
    >();
    for (const collectionVersionId of versionsByCollectionVersionId.keys()) {
      const collectionVersion =
        await this.repos.collectionVersion.find(collectionVersionId);
      assertCollectionVersionExists(collectionId, collectionVersion);
      collectionVersionsById.set(collectionVersionId, collectionVersion);
    }

    // Compute content summaries for each version
    const liteVersions: LiteDocumentVersion[] = [];
    for (const version of documentVersions) {
      const collectionVersion = collectionVersionsById.get(
        version.collectionVersionId,
      )!;
      const contentSummary = await makeContentSummary(
        this.javascriptSandbox,
        collectionVersion,
        version,
      );
      liteVersions.push(
        makeLiteDocumentVersionFromEntity(version, contentSummary),
      );
    }

    return makeSuccessfulResult(liteVersions);
  }
}
