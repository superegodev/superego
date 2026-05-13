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
import assertDocumentExists from "../../utils/assertDocumentExists.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import {
  document as documentDomainSchema,
  liteDocument,
} from "../../validation/domain/document.js";
import { textSearchResult } from "../../validation/domain/textSearchResult.js";
import {
  collectionNotFound,
  unexpectedError,
} from "../../validation/errors.js";
import { collectionId as collectionIdSchema } from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class DocumentsSearch extends BackendUsecase<
  Backend["documents"]["search"]
> {
  argumentsSchema = v.tuple([
    v.nullable(collectionIdSchema()),
    v.string(),
    v.strictObject({ limit: v.number() }),
  ]);
  resultSchema = makeResultSchema(
    v.array(
      textSearchResult(v.union([liteDocument(), documentDomainSchema()])),
    ),
    [collectionNotFound(), unexpectedError()],
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
