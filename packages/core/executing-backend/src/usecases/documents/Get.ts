import type {
  Backend,
  CollectionId,
  Document,
  DocumentId,
  DocumentNotFound,
  RpcResultPromise,
} from "@superego/backend";
import makeDocument from "../../makers/makeDocument.js";
import makeRpcError from "../../makers/makeRpcError.js";
import makeSuccessfulRpcResult from "../../makers/makeSuccessfulRpcResult.js";
import makeUnsuccessfulRpcResult from "../../makers/makeUnsuccessfulRpcResult.js";
import assertCollectionVersionExists from "../../utils/assertCollectionVersionExists.js";
import assertDocumentVersionExists from "../../utils/assertDocumentVersionExists.js";
import assertDocumentVersionMatchesCollectionVersion from "../../utils/assertDocumentVersionMatchesCollectionVersion.js";
import Usecase from "../../utils/Usecase.js";

export default class DocumentsGet extends Usecase<Backend["documents"]["get"]> {
  async exec(
    collectionId: CollectionId,
    id: DocumentId,
  ): RpcResultPromise<Document, DocumentNotFound> {
    const document = await this.repos.document.find(id);
    if (!document || document.collectionId !== collectionId) {
      return makeUnsuccessfulRpcResult(
        makeRpcError("DocumentNotFound", { documentId: id }),
      );
    }

    const latestCollectionVersion =
      await this.repos.collectionVersion.findLatestWhereCollectionIdEq(
        document.collectionId,
      );
    assertCollectionVersionExists(
      document.collectionId,
      latestCollectionVersion,
    );

    const latestVersion =
      await this.repos.documentVersion.findLatestWhereDocumentIdEq(id);
    assertDocumentVersionExists(document.collectionId, id, latestVersion);
    assertDocumentVersionMatchesCollectionVersion(
      document.collectionId,
      latestCollectionVersion,
      document.id,
      latestVersion,
    );

    return makeSuccessfulRpcResult(
      await makeDocument(
        this.javascriptSandbox,
        latestCollectionVersion,
        document,
        latestVersion,
      ),
    );
  }
}
