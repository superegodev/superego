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
  valibotSchemas,
} from "@superego/shared-utils";
import makeMinimalDocumentVersion from "../../makers/makeMinimalDocumentVersion.js";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class DocumentsListVersions extends Usecase<
  Backend["documents"]["listVersions"]
> {
  @validateArgs([valibotSchemas.id.collection(), valibotSchemas.id.document()])
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
