// TODO: AI generated, review
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
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import type DocumentEntity from "../../entities/DocumentEntity.js";
import type DocumentVersionEntity from "../../entities/DocumentVersionEntity.js";
import makeContentSummaries from "../../makers/makeContentSummaries.js";
import makeDocumentGivenSummary from "../../makers/makeDocumentGivenSummary.js";
import makeLiteDocument from "../../makers/makeLiteDocument.js";
import makeResultError from "../../makers/makeResultError.js";
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

    // Group search results by collectionId for efficient fetching
    const resultsByCollectionId = new Map<
      CollectionId,
      {
        collectionId: CollectionId;
        documentId: DocumentId;
        matchedText: string;
      }[]
    >();
    for (const result of searchResults) {
      const existing = resultsByCollectionId.get(result.collectionId) ?? [];
      existing.push(result);
      resultsByCollectionId.set(result.collectionId, existing);
    }

    // Fetch all relevant collection versions
    const collectionVersions =
      await this.repos.collectionVersion.findAllLatests();
    const collectionVersionByCollectionId = new Map<
      CollectionId,
      CollectionVersionEntity
    >();
    for (const cv of collectionVersions) {
      collectionVersionByCollectionId.set(cv.collectionId, cv);
    }

    // Fetch documents and their versions, then build TextSearchResults
    const textSearchResults: TextSearchResult<LiteDocument>[] = [];

    for (const [colId, results] of resultsByCollectionId) {
      const collectionVersion = collectionVersionByCollectionId.get(colId);
      if (!collectionVersion) {
        // Skip if collection version doesn't exist (shouldn't happen in normal operation)
        continue;
      }

      // Fetch documents and versions for this collection's search results
      const documents: DocumentEntity[] = [];
      const documentVersions: DocumentVersionEntity[] = [];
      const matchedTexts: string[] = [];

      for (const result of results) {
        const document = await this.repos.document.find(result.documentId);
        if (!document) {
          // Document may have been deleted since indexing
          continue;
        }
        const latestVersion =
          await this.repos.documentVersion.findLatestWhereDocumentIdEq(
            result.documentId,
          );
        assertDocumentVersionExists(colId, result.documentId, latestVersion);
        assertDocumentVersionMatchesCollectionVersion(
          colId,
          collectionVersion,
          result.documentId,
          latestVersion,
        );
        documents.push(document);
        documentVersions.push(latestVersion);
        matchedTexts.push(result.matchedText);
      }

      if (documents.length === 0) {
        continue;
      }

      const contentSummaries = await makeContentSummaries(
        this.javascriptSandbox,
        collectionVersion,
        documentVersions,
      );

      for (let i = 0; i < documents.length; i++) {
        const document = makeDocumentGivenSummary(
          documents[i]!,
          documentVersions[i]!,
          contentSummaries[i]!,
        );
        textSearchResults.push({
          match: makeLiteDocument(document),
          matchedText: matchedTexts[i]!,
        });
      }
    }

    return makeSuccessfulResult(textSearchResults);
  }
}
