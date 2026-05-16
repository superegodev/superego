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
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class DocumentsGetVersion extends BackendUsecase<
  Backend["documents"]["getVersion"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.collectionId(),
    structuralSchemas.backend.ids.documentId(),
    structuralSchemas.backend.ids.documentVersionId(),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.documentVersion(),
    [
      structuralSchemas.backend.errors.documentVersionNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

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
