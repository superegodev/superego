import type {
  Backend,
  CollectionId,
  DocumentId,
  FileId,
  FileNotFound,
  RpcResultPromise,
} from "@superego/backend";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import Usecase from "../../utils/Usecase.js";

export default class FilesGetContent extends Usecase<
  Backend["files"]["getContent"]
> {
  async exec(
    collectionId: CollectionId,
    documentId: DocumentId,
    id: FileId,
  ): RpcResultPromise<Uint8Array, FileNotFound> {
    const file = await this.repos.file.find(id);
    const content = await this.repos.file.getContent(id);
    if (
      !file ||
      file.collectionId !== collectionId ||
      file.documentId !== documentId ||
      !content
    ) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("FileNotFound", { fileId: id }),
      );
    }

    return makeSuccessfulRpcResult(content);
  }
}
