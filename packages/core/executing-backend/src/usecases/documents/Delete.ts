import type {
  Backend,
  CollectionId,
  CommandConfirmationNotValid,
  DeletedEntities,
  DocumentId,
  DocumentNotFound,
  RpcResultPromise,
} from "@superego/backend";
import makeDeletedEntities from "../../makers/makeDeletedEntities.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import Usecase from "../../utils/Usecase.js";

export default class DocumentsDelete extends Usecase<
  Backend["documents"]["delete"]
> {
  async exec(
    collectionId: CollectionId,
    id: DocumentId,
    commandConfirmation: string,
  ): RpcResultPromise<
    DeletedEntities,
    DocumentNotFound | CommandConfirmationNotValid
  > {
    if (commandConfirmation !== "delete") {
      return makeUnsuccessfulRpcResult(
        makeRpcError("CommandConfirmationNotValid", {
          requiredCommandConfirmation: "delete",
          suppliedCommandConfirmation: commandConfirmation,
        }),
      );
    }

    const document = await this.repos.document.find(id);
    if (!document || document.collectionId !== collectionId) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("DocumentNotFound", { documentId: id }),
      );
    }

    const deletedFileIds = await this.repos.file.deleteAllWhereDocumentIdEq(id);
    const deletedDocumentVersionIds =
      await this.repos.documentVersion.deleteAllWhereDocumentIdEq(id);
    await this.repos.document.delete(id);

    return makeSuccessfulRpcResult(
      makeDeletedEntities({
        documents: [id],
        documentVersion: deletedDocumentVersionIds,
        files: deletedFileIds,
      }),
    );
  }
}
