export declare function useCreateDocument(): {
  /** Create a **new document**. */
  mutate: (definition: {
    collectionId: string;
    /** Full content of the document. */
    content: any;
    options?: { skipDuplicateCheck: boolean };
  }) => void;
  isIdle: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: {
    name:
      | "CollectionNotFound"
      | "DocumentContentNotValid"
      | "FilesNotFound"
      | "UnexpectedError";
    details: any;
  } | null;
  data: null;
};

export declare function useDeleteDocument(): {
  /**
   * Delete a document. Returns immediately and opens a confirmation dialog for
   * the user.
   */
  mutate: (collectionId: string, id: string) => void;
  isIdle: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: {
    name: "UnexpectedError";
    details: any;
  } | null;
  data: null;
};

export declare function useCreateNewDocumentVersion(): {
  /** Create a **new immutable version** of an existing document. */
  mutate: (
    collectionId: string,
    id: string,
    /**
     * Latest known version at the time of the update. Used for optimistic
     * concurrency check.
     */
    latestVersionId: string,
    /** Full content of the new version. */
    content: any,
  ) => void;
  isIdle: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: {
    name:
      | "CollectionNotFound"
      | "DocumentNotFound"
      | "DocumentVersionIdNotMatching"
      | "DocumentContentNotValid"
      | "FilesNotFound"
      | "UnexpectedError";
    details: any;
  } | null;
  data: null;
};

export interface AppState<Content> {
  content: Content;
  revision: number;
  schemaId: string;
}
export interface AppStateError {
  name: "AppStateError";
  details: {
    reason:
      | "SchemaNotValid"
      | "MigrationRequired"
      | "MigrationFailed"
      | "SchemaRemovalNotAllowed"
      | "StateNotDefined"
      | "ContentNotValid"
      | "RevisionConflict"
      | "ObsoleteSchema"
      | "ObsoleteVersion";
  };
}
export interface AppBridgeError {
  name: "AppBridgeError";
  details: { reason: "InvalidArguments" | "TransportFailure" };
}
export type AppStateApiError =
  | AppStateError
  | AppBridgeError
  | {
      name: "AppNotFound" | "ArgumentsNotValid" | "UnexpectedError";
      details: unknown;
    };
export interface AsyncMutation<Data, Error, Variables> {
  mutate(variables: Variables): void;
  mutateAsync(variables: Variables): Promise<Data>;
  data: Data | undefined;
  error: Error | null;
  isIdle: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  reset(): void;
}
export declare function useAppState<Content = Record<string, unknown>>(): {
  data: AppState<Content> | undefined;
  error: AppStateApiError | null;
  isPending: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch(): Promise<unknown>;
};
export declare function useUpdateAppState<
  Content = Record<string, unknown>,
>(): AsyncMutation<
  AppState<Content>,
  AppStateApiError,
  { expectedRevision: number; content: Content }
>;
/** Requests through Superego. Browser runtimes require CORS support; previews return UnsupportedRuntime. */
export declare function useHttpRequest(): AsyncMutation<
  {
    status: number;
    headers: [string, string][];
    body: { encoding: "base64"; data: string };
    url: string;
  },
  | AppBridgeError
  | {
      name: "AppHttpError";
      details: {
        reason:
          | "DestinationDenied"
          | "UnsupportedRuntime"
          | "InvalidArguments"
          | "TransportFailure"
          | "ObsoleteInstance";
      };
    },
  {
    url: string;
    method?: string;
    headers?: [string, string][];
    body?: { encoding: "utf8" | "base64"; data: string };
  }
>;
