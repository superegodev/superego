import type {
  CollectionId,
  CollectionNotFound,
  ConnectorDoesNotSupportUpSyncing,
  Document,
  DocumentContentNotValid,
  DocumentId,
  DocumentNotFound,
  DocumentVersionId,
  DocumentVersionIdNotMatching,
  FileId,
  FileNotFound,
  FilesNotFound,
  UnexpectedError,
} from "@superego/backend";
import type { Result, ResultPromise } from "@superego/global-types";
import MessageType from "../../../ipc/MessageType.js";
import type SandboxIpc from "../../../ipc/SandboxIpc.js";

export default class Backend {
  constructor(private sandboxIpc: SandboxIpc) {
    sandboxIpc.registerHandlers({
      [MessageType.RespondToBackendMethodInvocation]: ({ payload }) => {
        const resolve = this.invocations.get(payload.invocationId);
        if (!resolve) {
          console.warn(
            "Received RespondToBackendMethodInvocation message with no corresponding invocation",
          );
          return;
        }
        resolve(payload.result);
      },
    });
  }
  private invocations = new Map<string, (result: Result<any, any>) => void>();

  createDocument(
    collectionId: CollectionId,
    content: any,
  ): ResultPromise<
    Document,
    | CollectionNotFound
    | ConnectorDoesNotSupportUpSyncing
    | DocumentContentNotValid
    | FilesNotFound
    | UnexpectedError
  > {
    return this.invokeMethod("documents", "create", [collectionId, content]);
  }

  createNewDocumentVersion(
    collectionId: CollectionId,
    id: DocumentId,
    latestVersionId: DocumentVersionId,
    content: any,
  ): ResultPromise<
    Document,
    | CollectionNotFound
    | DocumentNotFound
    | ConnectorDoesNotSupportUpSyncing
    | DocumentVersionIdNotMatching
    | DocumentContentNotValid
    | FilesNotFound
    | UnexpectedError
  > {
    return this.invokeMethod("documents", "createNewVersion", [
      collectionId,
      id,
      latestVersionId,
      content,
    ]);
  }

  getFileContent(
    id: FileId,
  ): ResultPromise<Uint8Array<ArrayBuffer>, FileNotFound | UnexpectedError> {
    return this.invokeMethod("files", "getContent", [id]);
  }

  private invokeMethod(entity: string, method: string, args: any[]) {
    const invocationId = crypto.randomUUID();
    return new Promise<Result<any, any>>((resolve) => {
      this.invocations.set(invocationId, resolve);
      this.sandboxIpc.send({
        type: MessageType.InvokeBackendMethod,
        payload: { invocationId, entity, method, args },
      });
    });
  }
}
