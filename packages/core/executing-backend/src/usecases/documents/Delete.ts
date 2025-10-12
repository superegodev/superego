import type {
  Backend,
  CollectionId,
  CommandConfirmationNotValid,
  DocumentId,
  DocumentIsRemote,
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

    if (document.remoteId !== null && !allowDeletingRemoteDocument) {
      return makeUnsuccessfulResult(
        makeResultError("DocumentIsRemote", {
          documentId: id,
          message:
            "Remote documents are read-only. You can't create new versions or delete them.",
        }),
      );
    }

    await this.repos.file.deleteAllWhereDocumentIdEq(id);
    await this.repos.documentVersion.deleteAllWhereDocumentIdEq(id);
    await this.repos.document.delete(id);

    return makeSuccessfulResult(null);
  }
}
