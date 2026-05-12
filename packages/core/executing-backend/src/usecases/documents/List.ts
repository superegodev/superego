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
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import type DocumentVersionEntity from "../../entities/DocumentVersionEntity.js";
import makeDocument from "../../makers/makeDocument.js";
import makeLiteDocument from "../../makers/makeLiteDocument.js";
import makeResultError from "../../makers/makeResultError.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import Usecase from "../../utils/Usecase.js";
import {
  document as documentDomainSchema,
  liteDocument,
} from "../../validation/domain/document.js";
import {
  collectionNotFound,
  unexpectedError,
} from "../../validation/errors.js";
import { collectionId as collectionIdSchema } from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class DocumentsList extends Usecase<
  Backend["documents"]["list"]
> {
  // The public Backend signature has overloads but `Parameters<>` resolves to
  // the last (widest) one: `(collectionId, lite?: false)`.
  argumentsSchema = v.tuple([
    collectionIdSchema(),
    v.optional(v.literal(false)),
  ]);
  resultSchema = makeResultSchema(
    v.array(v.union([liteDocument(), documentDomainSchema()])),
    [collectionNotFound(), unexpectedError()],
  );

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
      documents.map((documentEntity) => {
        const latestVersion = latestVersionsByDocumentId.get(documentEntity.id);
        assertDocumentVersionExists(
          documentEntity.collectionId,
          documentEntity.id,
          latestVersion,
        );
        const document = makeDocument(documentEntity, latestVersion);
        return lite ? makeLiteDocument(document) : document;
      }),
    );
  }
}
