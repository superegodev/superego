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
import pMap from "p-map";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeDocumentVersion from "../../makers/makeDocumentVersion.js";
import makeLiteDocumentVersion from "../../makers/makeLiteDocumentVersion.js";
import makeResultError from "../../makers/makeResultError.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class DocumentsListVersions extends Usecase<
  Backend["documents"]["listVersions"]
> {
  async exec(
    collectionId: CollectionId,
    id: DocumentId,
  ): ResultPromise<LiteDocumentVersion[], DocumentNotFound | UnexpectedError> {
    const document = await this.repos.document.find(id);
    if (!document || document.collectionId !== collectionId) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentNotFound", { documentId: id }),
      );
    }

    const documentVersions =
      await this.repos.documentVersion.findAllWhereDocumentIdEq(id);
    const collectionVersionIds = new Set(
      documentVersions.map(({ collectionVersionId }) => collectionVersionId),
    );
    const collectionVersionsById: Record<
      CollectionVersionId,
      CollectionVersionEntity
    > = {};
    for (const collectionVersionId of collectionVersionIds) {
      const collectionVersion =
        await this.repos.collectionVersion.find(collectionVersionId);
      assertCollectionVersionExists(collectionId, collectionVersion);
      collectionVersionsById[collectionVersionId] = collectionVersion;
    }

    return makeSuccessfulResult(
      await pMap(
        documentVersions,
        async (documentVersion) =>
          makeLiteDocumentVersion(
            await makeDocumentVersion(
              this.javascriptSandbox,
              collectionVersionsById[documentVersion.collectionVersionId]!,
              documentVersion,
            ),
          ),
        { concurrency: 1 },
      ),
    );
  }
}
