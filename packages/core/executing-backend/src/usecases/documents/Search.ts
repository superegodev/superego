import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  Document,
  LiteDocument,
  TextSearchResult,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
  valibotSchemas,
} from "@superego/shared-utils";
import pMap from "p-map";
import * as v from "valibot";
import makeDocument from "../../makers/makeDocument.js";
import makeLiteDocument from "../../makers/makeLiteDocument.js";
import makeResultError from "../../makers/makeResultError.js";
import assertDocumentExists from "../../utils/assertDocumentExists.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class DocumentsSearch extends Usecase<
  Backend["documents"]["search"]
> {
  async exec(
    collectionId: CollectionId | null,
    query: string,
    options: { limit: number },
  ): ResultPromise<
    TextSearchResult<LiteDocument>[],
    CollectionNotFound | UnexpectedError
  >;
  async exec(
    collectionId: CollectionId | null,
    query: string,
    options: { limit: number },
    lite: false,
  ): ResultPromise<
    TextSearchResult<Document>[],
    CollectionNotFound | UnexpectedError
  >;
  @validateArgs([
    v.nullable(valibotSchemas.id.collection()),
    v.string(),
    v.strictObject({ limit: v.number() }),
    v.boolean(),
  ])
  async exec(
    collectionId: CollectionId | null,
    query: string,
    options: { limit: number },
    lite = true,
  ): ResultPromise<
    TextSearchResult<LiteDocument | Document>[],
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
      options,
    );

    if (searchResults.length === 0) {
      return makeSuccessfulResult([]);
    }

    const textSearchResults = await pMap(
      searchResults,
      async (result) => {
        const [documentEntity, latestVersion] = await Promise.all([
          this.repos.document.find(result.documentId),
          this.repos.documentVersion.findLatestWhereDocumentIdEq(
            result.documentId,
          ),
        ]);
        assertDocumentExists(
          result.collectionId,
          result.documentId,
          documentEntity,
        );
        assertDocumentVersionExists(
          result.collectionId,
          result.documentId,
          latestVersion,
        );
        const document = makeDocument(documentEntity, latestVersion);
        return {
          match: lite ? makeLiteDocument(document) : document,
          matchedText: result.matchedText,
        };
      },
      { concurrency: 1 },
    );

    return makeSuccessfulResult(textSearchResults);
  }
}
