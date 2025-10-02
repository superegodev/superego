import type {
  Backend,
  Collection,
  CollectionHasNoRemote,
  CollectionId,
  CollectionNotFound,
  CommandConfirmationNotValid,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import type CollectionEntity from "../../entities/CollectionEntity.js";
import type CollectionVersionEntity from "../../entities/CollectionVersionEntity.js";
import makeCollection from "../../makers/makeCollection.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import Usecase from "../../utils/Usecase.js";
import DocumentsDelete from "../documents/Delete.js";

export default class CollectionsUnsetRemote extends Usecase<
  Backend["collections"]["unsetRemote"]
> {
  async exec(
    id: CollectionId,
    commandConfirmation: string,
  ): ResultPromise<
    Collection,
    | CollectionNotFound
    | CollectionHasNoRemote
    | CommandConfirmationNotValid
    | UnexpectedError
  > {
    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionNotFound", { collectionId: id }),
      );
    }

    if (!collection.remote) {
      return makeUnsuccessfulResult(
        makeResultError("CollectionHasNoRemote", {
          collectionId: id,
        }),
      );
    }

    if (commandConfirmation !== "unset") {
      return makeUnsuccessfulResult(
        makeResultError("CommandConfirmationNotValid", {
          requiredCommandConfirmation: "unset",
          suppliedCommandConfirmation: commandConfirmation,
        }),
      );
    }

    const latestVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(id);
    assertCollectionVersionExists(id, latestVersion);

    const updatedCollection: CollectionEntity = {
      ...collection,
      remote: null,
    };
    const updatedCollectionVersion: CollectionVersionEntity = {
      ...latestVersion,
      remoteConverters: null,
    };
    await this.repos.collection.replace(updatedCollection);
    await this.repos.collectionVersion.replace(updatedCollectionVersion);
    const documents = await this.repos.document.findAllWhereCollectionIdEq(id);
    for (const document of documents) {
      if (document.remoteId !== null) {
        await this.sub(DocumentsDelete).exec(id, document.id, "delete", true);
      }
    }

    return makeSuccessfulResult(
      makeCollection(updatedCollection, updatedCollectionVersion),
    );
  }
}
