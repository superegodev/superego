import type {
  AppNotFound,
  AppState,
  AppStateContentNotValid,
  AppStateNotDefined,
  AppStateRevisionNotMatching,
  AppStateSchemaIdNotMatching,
  AppStateSchemaNotValid,
  AppVersionIdNotMatching,
  ArgumentsNotValid,
  CollectionId,
  CollectionNotFound,
  Document,
  DocumentContentNotValid,
  DocumentDefinition,
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

export interface AppBridgeError {
  name: "AppBridgeError";
  details: { reason: "InvalidArguments" | "TransportFailure" };
}
export type GetAppStateError =
  | AppStateNotDefined
  | AppStateSchemaIdNotMatching
  | AppVersionIdNotMatching
  // Preview initialization can fail validation before any state exists.
  | AppStateSchemaNotValid
  | AppStateContentNotValid
  | AppNotFound
  | ArgumentsNotValid
  | UnexpectedError
  | AppBridgeError;
export type UpdateAppStateError =
  | GetAppStateError
  | AppStateRevisionNotMatching;

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

  deleteDocument(
    collectionId: CollectionId,
    id: DocumentId,
  ): ResultPromise<null, UnexpectedError> {
    return this.invokeMethod("documents", "delete", [collectionId, id]);
  }

  getFileContent(
    id: FileId,
  ): ResultPromise<Uint8Array<ArrayBuffer>, FileNotFound | UnexpectedError> {
    return this.invokeMethod("files", "getContent", [id]);
  }

  /** Each iframe owns one QueryClient and one host-established app context. */
  readonly stateQueryKey = ["appState", crypto.randomUUID()];
  getState(): ResultPromise<AppState, GetAppStateError> {
    return this.invokeMethod("state", "get", []);
  }
  updateState(
    expectedRevision: number,
    content: Record<string, unknown>,
  ): ResultPromise<AppState, UpdateAppStateError> {
    return this.invokeMethod("state", "update", [expectedRevision, content]);
  }

  private invokeMethod(entity: string, method: string, args: any[]) {
    const invocationId = crypto.randomUUID();
    return new Promise<Result<any, any>>((resolve) => {
      const timeout = setTimeout(() => {
        this.invocations.delete(invocationId);
        resolve({
          success: false,
          data: null,
          error: {
            name: "AppBridgeError",
            details: { reason: "TransportFailure" },
          },
        });
      }, 35_000);
      this.invocations.set(invocationId, (result) => {
        clearTimeout(timeout);
        resolve(result);
      });
      this.sandboxIpc.send({
        type: MessageType.InvokeBackendMethod,
        payload: { invocationId, entity, method, args },
      });
    });
  }
}
