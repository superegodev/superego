import type {
  AppNotFound,
  AppState,
  AppStateContentNotValid,
  AppStateRevisionNotMatching,
  AppVersionIdNotMatching,
  ArgumentsNotValid,
  CollectionId,
  CollectionNotFound,
  Document,
  DocumentContentNotValid,
  DocumentContentPatchNotValid,
  DocumentDefinition,
  DocumentId,
  DocumentNotFound,
  DocumentVersionId,
  DocumentVersionIdNotMatching,
  DuplicateDocumentDetected,
  FileId,
  FileNotFound,
  FilesNotFound,
  MakingContentBlockingKeysFailed,
  ReferencedDocumentsNotFound,
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
        this.invocations.delete(payload.invocationId);
        resolve(payload.result);
      },
    });
  }
  private invocations = new Map<string, (result: Result<any, any>) => void>();

  createDocument(
    definition: DocumentDefinition,
  ): ResultPromise<
    Document,
    | CollectionNotFound
    | DocumentContentNotValid
    | FilesNotFound
    | ReferencedDocumentsNotFound
    | MakingContentBlockingKeysFailed
    | DuplicateDocumentDetected
    | ArgumentsNotValid
    | UnexpectedError
  > {
    return this.invokeMethod("documents", "create", [definition]);
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
    | DocumentVersionIdNotMatching
    | DocumentContentPatchNotValid
    | DocumentContentNotValid
    | MakingContentBlockingKeysFailed
    | FilesNotFound
    | ReferencedDocumentsNotFound
    | ArgumentsNotValid
    | UnexpectedError
  > {
    return this.invokeMethod("documents", "createNewVersion", [
      collectionId,
      id,
      latestVersionId,
      content,
    ]);
  }

  deleteDocument(
    collectionId: CollectionId,
    id: DocumentId,
  ): ResultPromise<null, ArgumentsNotValid | UnexpectedError> {
    return this.invokeMethod("documents", "delete", [collectionId, id]);
  }

  getFileContent(
    id: FileId,
  ): ResultPromise<
    Uint8Array<ArrayBuffer>,
    FileNotFound | ArgumentsNotValid | UnexpectedError
  > {
    return this.invokeMethod("files", "getContent", [id]);
  }

  getState(): ResultPromise<
    AppState,
    AppVersionIdNotMatching | AppNotFound | ArgumentsNotValid | UnexpectedError
  > {
    return this.invokeMethod("state", "get", []);
  }

  updateState(
    latestRevision: number,
    content: any,
  ): ResultPromise<
    AppState,
    | AppVersionIdNotMatching
    | AppNotFound
    | ArgumentsNotValid
    | UnexpectedError
    | AppStateContentNotValid
    | AppStateRevisionNotMatching
  > {
    return this.invokeMethod("state", "update", [latestRevision, content]);
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
