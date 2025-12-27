import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  DocumentId,
  LiteDocument,
  TextSearchResult,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import pMap from "p-map";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeContentSummaries from "../../makers/makeContentSummaries.js";
import makeDocumentGivenSummary from "../../makers/makeDocumentGivenSummary.js";
import makeLiteDocument from "../../makers/makeLiteDocument.js";
import makeResultError from "../../makers/makeResultError.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import assertDocumentExists from "../../utils/assertDocumentExists.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import assertDocumentVersionMatchesCollectionVersion from "../../utils/assertDocumentVersionMatchesCollectionVersion.js";
import Usecase from "../../utils/Usecase.js";

export default class DocumentsSearch extends Usecase<
  Backend["documents"]["search"]
> {
  async exec(
    collectionId: CollectionId | null,
    query: string,
  ): ResultPromise<
    TextSearchResult<LiteDocument>[],
    CollectionNotFound | UnexpectedError
  > {
    if (collectionId && !(await this.repos.collection.exists(collectionId))) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId }),
      );
    }

    const searchResults = await this.repos.documentTextSearchIndex.search(
      collectionId,
      query,
    );

    if (searchResults.length === 0) {
      return makeSuccessfulResult([]);
    }

    const collectionVersions =
      await this.repos.collectionVersion.findAllLatests();

    const collectionVersionByCollectionId = new Map(
      collectionVersions.map((collectionVersion) => [
        collectionVersion.collectionId,
        collectionVersion,
      ]),
    );

    const resultsByCollectionId = Map.groupBy(
      searchResults,
      (result) => result.collectionId,
    );

    const textSearchResults = await pMap(
      [...resultsByCollectionId.entries()],
      ([colId, results]) =>
        this.makeTextSearchResults(
          colId,
          results,
          collectionVersionByCollectionId,
        ),
    );

    return makeSuccessfulResult(textSearchResults.flat());
  }

  private async makeTextSearchResults(
    collectionId: CollectionId,
    results: { documentId: DocumentId; matchedText: string }[],
    collectionVersionByCollectionId: Map<CollectionId, CollectionVersionEntity>,
  ): Promise<TextSearchResult<LiteDocument>[]> {
    const collectionVersion = collectionVersionByCollectionId.get(collectionId);
    assertCollectionVersionExists(collectionId, collectionVersion);

    const documentsWithVersions = await pMap(results, async (result) => {
      const [document, latestVersion] = await Promise.all([
        this.repos.document.find(result.documentId),
        this.repos.documentVersion.findLatestWhereDocumentIdEq(
          result.documentId,
        ),
      ]);
      assertDocumentExists(collectionId, result.documentId, document);
      assertDocumentVersionExists(
        collectionId,
        result.documentId,
        latestVersion,
      );
      assertDocumentVersionMatchesCollectionVersion(
        collectionId,
        collectionVersion,
        result.documentId,
        latestVersion,
      );
      return { document, latestVersion, matchedText: result.matchedText };
    });

    const contentSummaries = await makeContentSummaries(
      this.javascriptSandbox,
      collectionVersion,
      documentsWithVersions.map(({ latestVersion }) => latestVersion),
    );

    return documentsWithVersions.map((item, i) => ({
      match: makeLiteDocument(
        makeDocumentGivenSummary(
          item.document,
          item.latestVersion,
          contentSummaries[i]!,
        ),
      ),
      matchedText: item.matchedText,
    }));
  }
}
