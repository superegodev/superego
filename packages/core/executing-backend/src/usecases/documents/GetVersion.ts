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
  valibotSchemas,
} from "@superego/shared-utils";
import makeDocumentVersion from "../../makers/makeDocumentVersion.js";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class DocumentsGetVersion extends Usecase<
  Backend["documents"]["getVersion"]
> {
  @validateArgs([
    valibotSchemas.id.collection(),
    valibotSchemas.id.document(),
    valibotSchemas.id.documentVersion(),
  ])
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
