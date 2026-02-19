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
  valibotSchemas,
} from "@superego/shared-utils";
import makeDocument from "../../makers/makeDocument.js";
import makeResultError from "../../makers/makeResultError.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class DocumentsGet extends Usecase<Backend["documents"]["get"]> {
  @validateArgs([valibotSchemas.id.collection(), valibotSchemas.id.document()])
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
