import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  CommandConfirmationNotValid,
  DocumentId,
  DocumentIsReferenced,
  DocumentNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type { DocumentRef } from "@superego/schema";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class DocumentsDelete extends BackendUsecase<
  Backend["documents"]["delete"]
> {
  argumentsSchema = v.tuple([
    structuralSchemas.backend.ids.collectionId(),
    structuralSchemas.backend.ids.documentId(),
    v.string(),
  ]);
  resultSchema = structuralSchemas.global.result(v.null(), [
    structuralSchemas.backend.errors.collectionNotFound(),
    structuralSchemas.backend.errors.commandConfirmationNotValid(),
    structuralSchemas.backend.errors.documentIsReferenced(),
    structuralSchemas.backend.errors.documentNotFound(),
    structuralSchemas.backend.errors.unexpectedError(),
  ]);

  async exec(
    collectionId: CollectionId,
    id: DocumentId,
    commandConfirmation: string,
    ignoreIntraCollectionRefs = false,
  ): ResultPromise<
    null,
    | CollectionNotFound
    | DocumentNotFound
    | CommandConfirmationNotValid
    | DocumentIsReferenced
    | UnexpectedError
  > {
    if (commandConfirmation !== "delete") {
      return makeUnsuccessfulResult(
        makeResultError("CommandConfirmationNotValid", {
          requiredCommandConfirmation: "delete",
          suppliedCommandConfirmation: commandConfirmation,
        }),
      );
    }

    const collection = await this.repos.collection.find(collectionId);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId }),
      );
    }

    const document = await this.repos.document.find(id);
    if (!document || document.collectionId !== collectionId) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentNotFound", { documentId: id }),
      );
    }

    // Check if any documents reference this document.
    const referencingVersions =
      await this.repos.documentVersion.findAllLatestWhereReferencedDocumentsContains(
        collectionId,
        id,
      );
    const referencingDocuments: DocumentRef[] = referencingVersions
      .filter(
        (documentVersion) =>
          // Self-references.
          documentVersion.documentId !== id &&
          // Intra-collection references, if ignored.
          (!ignoreIntraCollectionRefs ||
            documentVersion.collectionId !== collectionId),
      )
      .map((documentVersion) => ({
        collectionId: documentVersion.collectionId,
        documentId: documentVersion.documentId,
      }));
    if (referencingDocuments.length > 0) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentIsReferenced", {
          collectionId,
          documentId: id,
          referencingDocuments,
        }),
      );
    }

    await this.repos.file.deleteReferenceFromAll({
      collectionId: collectionId,
      documentId: id,
    });
    await this.repos.documentTextSearchIndex.remove(collectionId, id);
    await this.repos.documentVersion.deleteAllWhereDocumentIdEq(id);
    await this.repos.document.delete(id);

    return makeSuccessfulResult(null);
  }
}
