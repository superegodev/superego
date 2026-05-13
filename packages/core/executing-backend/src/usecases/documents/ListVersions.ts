import type {
  Backend,
  CollectionId,
  DocumentId,
  DocumentNotFound,
  MinimalDocumentVersion,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeMinimalDocumentVersion from "../../makers/makeMinimalDocumentVersion.js";
import makeResultError from "../../makers/makeResultError.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import { minimalDocumentVersion } from "../../validation/domain/document.js";
import { documentNotFound, unexpectedError } from "../../validation/errors.js";
import {
  collectionId as collectionIdSchema,
  documentId as documentIdSchema,
} from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class DocumentsListVersions extends BackendUsecase<
  Backend["documents"]["listVersions"]
> {
  argumentsSchema = v.tuple([collectionIdSchema(), documentIdSchema()]);
  resultSchema = makeResultSchema(v.array(minimalDocumentVersion()), [
    documentNotFound(),
    unexpectedError(),
  ]);

  async exec(
    collectionId: CollectionId,
    id: DocumentId,
  ): ResultPromise<
    MinimalDocumentVersion[],
    DocumentNotFound | UnexpectedError
  > {
    const document = await this.repos.document.find(id);
    if (!document || document.collectionId !== collectionId) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentNotFound", { documentId: id }),
      );
    }

    const documentVersions =
      await this.repos.documentVersion.findAllWhereDocumentIdEq(id);

    return makeSuccessfulResult(
      documentVersions.map(makeMinimalDocumentVersion),
    );
  }
}
