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
import makeDocumentVersion from "../../makers/makeDocumentVersion.js";
import makeResultError from "../../makers/makeResultError.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";

export default class DocumentsGetVersion extends Usecase<
  Backend["documents"]["getVersion"]
> {
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

    const collectionVersion = await this.repos.collectionVersion.find(
      documentVersion.collectionVersionId,
    );
    assertCollectionVersionExists(collectionId, collectionVersion);

    return makeSuccessfulResult(
      await makeDocumentVersion(
        this.javascriptSandbox,
        collectionVersion,
        documentVersion,
      ),
    );
  }
}
