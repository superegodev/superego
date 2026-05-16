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
import * as structuralSchemas from "../../structural-schemas/index.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class DocumentsGet extends BackendUsecase<
  Backend["documents"]["get"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.collectionId(),
    structuralSchemas.backend.ids.documentId(),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.document(),
    [
      structuralSchemas.backend.errors.documentNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

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
