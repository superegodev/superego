import type {
  Backend,
  CollectionId,
  DocumentId,
  DocumentVersion,
  DocumentVersionId,
  DocumentVersionNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeDocumentVersion from "../../makers/makeDocumentVersion.js";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";
import { documentVersion as documentVersionSchema } from "../../validation/domain/document.js";
import {
  documentVersionNotFound,
  unexpectedError,
} from "../../validation/errors.js";
import {
  collectionId as collectionIdSchema,
  documentId as documentIdSchema,
  documentVersionId as documentVersionIdSchema,
} from "../../validation/helpers/idSchemas.js";
import makeResultSchema from "../../validation/helpers/makeResultSchema.js";

export default class DocumentsGetVersion extends Usecase<
  Backend["documents"]["getVersion"]
> {
  argumentsSchema = v.tuple([
    collectionIdSchema(),
    documentIdSchema(),
    documentVersionIdSchema(),
  ]);
  resultSchema = makeResultSchema(documentVersionSchema(), [
    documentVersionNotFound(),
    unexpectedError(),
  ]);

  async exec(
    collectionId: CollectionId,
    documentId: DocumentId,
    documentVersionId: DocumentVersionId,
  ): ResultPromise<DocumentVersion, DocumentVersionNotFound | UnexpectedError> {
    const documentVersion =
      await this.repos.documentVersion.find(documentVersionId);
    const document = await this.repos.document.find(documentId);
    if (
      !documentVersion ||
      !document ||
      documentVersion.documentId !== documentId ||
      documentVersion.collectionId !== collectionId ||
      document.collectionId !== collectionId
    ) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentVersionNotFound", {
          collectionId,
          documentId,
          documentVersionId,
        }),
      );
    }

    return makeSuccessfulResult(makeDocumentVersion(documentVersion));
  }
}
