import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  CommandConfirmationNotValid,
  ConnectorDoesNotSupportUpSyncing,
  DocumentId,
  DocumentNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import Usecase from "../../utils/Usecase.js";

export default class DocumentsDelete extends Usecase<
  Backend["documents"]["delete"]
> {
  async exec(
    collectionId: CollectionId,
    id: DocumentId,
    commandConfirmation: string,
    allowDeletingRemoteDocument = false,
  ): ResultPromise<
    null,
    | CollectionNotFound
    | DocumentNotFound
    | ConnectorDoesNotSupportUpSyncing
    | CommandConfirmationNotValid
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
