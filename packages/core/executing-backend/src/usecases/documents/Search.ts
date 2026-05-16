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
} from "@superego/shared-utils";
import pMap from "p-map";
import * as v from "valibot";
import makeDocument from "../../makers/makeDocument.js";
import makeLiteDocument from "../../makers/makeLiteDocument.js";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertDocumentExists from "../../utils/assertDocumentExists.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class DocumentsSearch extends BackendUsecase<
  Backend["documents"]["search"]
> {
  argumentsSchema = v.tuple([
    v.nullable(structuralSchemas.backend.ids.collectionId()),
    v.string(),
    v.strictObject({ limit: v.number() }),
  ]);
  resultSchema = structuralSchemas.global.result(
    v.array(
      structuralSchemas.backend.types.textSearchResult(
        structuralSchemas.backend.types.liteDocument(),
      ),
    ),
    [
      structuralSchemas.backend.errors.collectionNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

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
