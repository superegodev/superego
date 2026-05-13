import type {
  Backend,
  CollectionId,
  Document,
  DocumentId,
  DocumentNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeDocument from "../../makers/makeDocument.js";
import makeResultError from "../../makers/makeResultError.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";
import { document as documentDomainSchema } from "../../validation/domain/document.js";
import { documentNotFound, unexpectedError } from "../../validation/errors.js";
import {
  collectionId as collectionIdSchema,
  documentId as documentIdSchema,
} from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class DocumentsGet extends BackendUsecase<
  Backend["documents"]["get"]
> {
  argumentsSchema = v.tuple([collectionIdSchema(), documentIdSchema()]);
  resultSchema = makeResultSchema(documentDomainSchema(), [
    documentNotFound(),
    unexpectedError(),
  ]);

  async exec(
    collectionId: CollectionId,
    id: DocumentId,
  ): ResultPromise<Document, DocumentNotFound | UnexpectedError> {
    const document = await this.repos.document.find(id);
    if (!document || document.collectionId !== collectionId) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentNotFound", { documentId: id }),
      );
    }

    const latestVersion =
      await this.repos.documentVersion.findLatestWhereDocumentIdEq(id);
    assertDocumentVersionExists(document.collectionId, id, latestVersion);

    return makeSuccessfulResult(makeDocument(document, latestVersion));
  }
}
