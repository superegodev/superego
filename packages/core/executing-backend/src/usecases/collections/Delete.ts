import {
  AppType,
  type Backend,
  type CollectionId,
  type CollectionIsReferenced,
  type CollectionNotFound,
  type CommandConfirmationNotValid,
  type DocumentIsReferenced,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import { utils as schemaUtils } from "@superego/schema";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
import isEmpty from "../../utils/isEmpty.js";
import Usecase from "../../utils/Usecase.js";
import AppsDelete from "../apps/Delete.js";
import AppsList from "../apps/List.js";
import DocumentsDelete from "../documents/Delete.js";

export default class CollectionsDelete extends Usecase<
  Backend["collections"]["delete"]
> {
  async exec(
    id: CollectionId,
    commandConfirmation: string,
  ): ResultPromise<
    null,
    | CollectionNotFound
    | CommandConfirmationNotValid
    | CollectionIsReferenced
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

    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

    // Check if any other collection's schema references this collection.
    const allLatestCollectionVersions =
      await this.repos.collectionVersion.findAllLatests();
    const referencingCollectionIds: CollectionId[] = [];
    for (const collectionVersion of allLatestCollectionVersions) {
      // Skip the collection being deleted.
      if (collectionVersion.collectionId === id) {
        continue;
      }
      const referencedCollectionIds =
        schemaUtils.extractReferencedCollectionIds(collectionVersion.schema);
      if (referencedCollectionIds.includes(id)) {
        referencingCollectionIds.push(collectionVersion.collectionId);
      }
    }
    if (!isEmpty(referencingCollectionIds)) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionIsReferenced", {
          collectionId: id,
          referencingCollectionIds,
        }),
      );
    }

    // Delete all documents of the collection.
    const documents = await this.repos.document.findAllWhereCollectionIdEq(id);
    for (const document of documents) {
      const deleteDocumentResult = await this.sub(DocumentsDelete).exec(
        id,
        document.id,
        "delete",
        // allowDeletingRemoteDocument
        true,
        // ignoreIntraCollectionRefs, to allow deleting documents that reference
        // each other within this collection.
        true,
      );
      if (!deleteDocumentResult.success) {
        // If a document is referenced by documents outside this collection,
        // return the error to the caller.
        if (deleteDocumentResult.error.name === "DocumentIsReferenced") {
          return makeUnsuccessfulResult(deleteDocumentResult.error);
        }
        throw deleteDocumentResult.error;
      }
    }

    // Delete all CollectionView apps that only target this collection.
    const listAppsResult = await this.sub(AppsList).exec();
    if (!listAppsResult.success) {
      throw listAppsResult.error;
    }
    for (const app of listAppsResult.data) {
      if (
        app.type === AppType.CollectionView &&
        app.latestVersion.targetCollections.length === 1 &&
        app.latestVersion.targetCollections[0]?.id === id
      ) {
        const deleteAppResult = await this.sub(AppsDelete).exec(
          app.id,
          "delete",
        );
        if (!deleteAppResult.success) {
          throw deleteAppResult.error;
        }
      }
    }

    // Delete this collection's versions and the collection itself.
    await this.repos.collectionVersion.deleteAllWhereCollectionIdEq(id);
    await this.repos.collection.delete(id);

    return makeSuccessfulResult(null);
  }
}
