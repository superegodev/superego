import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  CommandConfirmationNotValid,
  DeletedEntities,
  RpcResultPromise,
} from "@superego/backend";
import makeDeletedEntities from "../../makers/makeDeletedEntities.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import Usecase from "../../utils/Usecase.js";

export default class CollectionsDelete extends Usecase<
  Backend["collections"]["delete"]
> {
  async exec(
    id: CollectionId,
    commandConfirmation: string,
  ): RpcResultPromise<
    DeletedEntities,
    CollectionNotFound | CommandConfirmationNotValid
  > {
    if (commandConfirmation !== "delete") {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CommandConfirmationNotValid", {
          requiredCommandConfirmation: "delete",
          suppliedCommandConfirmation: commandConfirmation,
        }),
      );
    }

    const collection = await this.repos.collection.find(id);
    if (!collection) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CollectionNotFound", { collectionId: id }),
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

    return makeSuccessfulRpcResult(
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
