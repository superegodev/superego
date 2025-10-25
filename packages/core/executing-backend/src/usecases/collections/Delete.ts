import {
  AppType,
  type Backend,
  type CollectionId,
  type CollectionNotFound,
  type CommandConfirmationNotValid,
  type UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeResultError from "../../makers/makeResultError.js";
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
    CollectionNotFound | CommandConfirmationNotValid | UnexpectedError
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

    // Delete all documents of the collection.
    const documents = await this.repos.document.findAllWhereCollectionIdEq(id);
    for (const document of documents) {
      const deleteDocumentResult = await this.sub(DocumentsDelete).exec(
        id,
        document.id,
        "delete",
        true,
      );
      if (!deleteDocumentResult.success) {
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
