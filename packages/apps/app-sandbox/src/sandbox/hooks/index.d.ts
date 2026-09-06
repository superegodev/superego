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
}
export interface AppVersionIdNotMatching {
  name: "AppVersionIdNotMatching";
  details: {
    appId: string;
    latestVersionId: string;
    suppliedVersionId: string;
  };
}
export interface AppStateRevisionNotMatching {
  name: "AppStateRevisionNotMatching";
  details: { appId: string; latestRevision: number; suppliedRevision: number };
}
export interface AppStateSchemaNotValid {
  name: "AppStateSchemaNotValid";
  details: {
    appId: string | null;
    issues: {
      message: string;
      path?: { key: string | number }[] | undefined;
    }[];
  };
}
export interface AppStateContentNotValid {
  name: "AppStateContentNotValid";
  details: {
    appId: string | null;
    issues: {
      message: string;
      path?: { key: string | number }[] | undefined;
    }[];
  };
}
export interface AppBridgeError {
  name: "AppBridgeError";
  details: { reason: "InvalidArguments" | "TransportFailure" };
}
export type GetAppStateError =
  | AppVersionIdNotMatching
  // Preview initialization can fail validation before any state exists.
  | AppStateSchemaNotValid
  | AppStateContentNotValid
  | AppBridgeError
  | {
      name: "AppNotFound" | "ArgumentsNotValid" | "UnexpectedError";
      details: unknown;
    };
export type UpdateAppStateError =
  | GetAppStateError
  | AppStateRevisionNotMatching;
export declare function useAppState<Content = Record<string, unknown>>(): {
  data: AppState<Content> | undefined;
  error: GetAppStateError | null;
  isLoading: boolean;
  /** Reload saved state. Rejects with GetAppStateError on failure. */
  refetch(): Promise<void>;
};
/** Returns an update function. Rejects with UpdateAppStateError on failure. */
export declare function useUpdateAppState<
  Content extends Record<string, unknown> = Record<string, unknown>,
>(): (update: {
  expectedRevision: number;
  content: Content;
}) => Promise<AppState<Content>>;
