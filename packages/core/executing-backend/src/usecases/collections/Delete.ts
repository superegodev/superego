import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  CommandConfirmationNotValid,
  DeletedEntities,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import makeDeletedEntities from "../../makers/makeDeletedEntities.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsDelete extends Usecase<
  Backend["collections"]["delete"]
> {
  async exec(
    id: CollectionId,
    commandConfirmation: string,
  ): ResultPromise<
    DeletedEntities,
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

    const deletedFileIds =
      await this.repos.file.deleteAllWhereCollectionIdEq(id);
    const deletedDocumentVersionIds =
      await this.repos.documentVersion.deleteAllWhereCollectionIdEq(id);
    const deletedDocumentIds =
      await this.repos.document.deleteAllWhereCollectionIdEq(id);
    const deletedCollectionVersionIds =
      await this.repos.collectionVersion.deleteAllWhereCollectionIdEq(id);
    await this.repos.collection.delete(id);

    return makeSuccessfulResult(
      makeDeletedEntities({
        collections: [id],
        collectionVersions: deletedCollectionVersionIds,
        documents: deletedDocumentIds,
        documentVersion: deletedDocumentVersionIds,
        files: deletedFileIds,
      }),
    );
  }
}
