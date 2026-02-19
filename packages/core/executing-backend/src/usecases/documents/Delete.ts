import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  CommandConfirmationNotValid,
  ConnectorDoesNotSupportUpSyncing,
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
  valibotSchemas,
} from "@superego/shared-utils";
import * as v from "valibot";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";
import validateArgs from "../../utils/validateArgs.js";

export default class DocumentsDelete extends Usecase<
  Backend["documents"]["delete"]
> {
  @validateArgs([
    valibotSchemas.id.collection(),
    valibotSchemas.id.document(),
    v.string(),
    v.boolean(),
    v.boolean(),
  ])
  async exec(
    collectionId: CollectionId,
    id: DocumentId,
    commandConfirmation: string,
    allowDeletingRemoteDocument = false,
    ignoreIntraCollectionRefs = false,
  ): ResultPromise<
    null,
    | CollectionNotFound
    | DocumentNotFound
    | ConnectorDoesNotSupportUpSyncing
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

    // Right now no connector supports up-syncing, so checking if the collection
    // has a remote is sufficient. TODO: update condition once connectors
    // support up-syncing.
    if (collection.remote !== null && !allowDeletingRemoteDocument) {
      return makeUnsuccessfulResult(
        makeResultError("ConnectorDoesNotSupportUpSyncing", {
          collectionId: collectionId,
          connectorName: collection.remote.connector.name,
          message:
            "The collection has a remote, and its connector does not support up-syncing. This effectively makes the collection read-only.",
        }),
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
