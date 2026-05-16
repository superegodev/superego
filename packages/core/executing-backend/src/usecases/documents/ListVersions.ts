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
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class DocumentsListVersions extends BackendUsecase<
  Backend["documents"]["listVersions"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.collectionId(),
    structuralSchemas.backend.ids.documentId(),
  ]);
  resultSchema = structuralSchemas.global.result(
    v.array(structuralSchemas.backend.types.minimalDocumentVersion()),
    [
      structuralSchemas.backend.errors.documentNotFound(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

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
