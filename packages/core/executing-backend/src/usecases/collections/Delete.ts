import type {
  Backend,
  CollectionId,
  CollectionNotFound,
  CommandConfirmationNotValid,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
import Usecase from "../../utils/Usecase.js";
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

    const documents = await this.repos.document.findAllWhereCollectionIdEq(id);
    for (const document of documents) {
      await this.sub(DocumentsDelete).exec(id, document.id, "delete", true);
    }
    await this.repos.collectionVersion.deleteAllWhereCollectionIdEq(id);
    await this.repos.collection.delete(id);

    return makeSuccessfulResult(null);
  }
}
