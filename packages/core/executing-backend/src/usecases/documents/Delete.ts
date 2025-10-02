import type {
  Backend,
  CollectionId,
  CommandConfirmationNotValid,
  DeletedEntities,
  DocumentId,
  DocumentIsRemote,
  DocumentNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";
import makeDeletedEntities from "../../makers/makeDeletedEntities.js";
import makeResultError from "../../makers/makeResultError.js";
import makeSuccessfulResult from "../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../makers/makeUnsuccessfulResult.js";
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
    DeletedEntities,
    | DocumentNotFound
    | DocumentIsRemote
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

    const document = await this.repos.document.find(id);
    if (!document || document.collectionId !== collectionId) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentNotFound", { documentId: id }),
      );
    }

    if (document.remoteId && !allowDeletingRemoteDocument) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentIsRemote", {
          documentId: id,
          message:
            "Remote documents are read-only. You can't create new versions or delete them.",
        }),
      );
    }

    const deletedFileIds = await this.repos.file.deleteAllWhereDocumentIdEq(id);
    const deletedDocumentVersionIds =
      await this.repos.documentVersion.deleteAllWhereDocumentIdEq(id);
    await this.repos.document.delete(id);

    return makeSuccessfulResult(
      makeDeletedEntities({
        documents: [id],
        documentVersion: deletedDocumentVersionIds,
        files: deletedFileIds,
      }),
    );
  }
}
