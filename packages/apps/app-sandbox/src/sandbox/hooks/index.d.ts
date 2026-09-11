////////////
// Errors //
////////////

export interface AppNotFound {
  name: "AppNotFound";
  details: {
    appId: string;
  };
}

export interface AppStateContentNotValid {
  name: "AppStateContentNotValid";
  details: {
    appId: string | null;
    issues: ValidationIssue[];
  };
}

export interface AppStateRevisionNotMatching {
  name: "AppStateRevisionNotMatching";
  details: {
    appId: string;
    latestRevision: number;
    suppliedRevision: number;
  };
}

export interface AppStateSchemaNotValid {
  name: "AppStateSchemaNotValid";
  details: {
    appId: string | null;
    issues: ValidationIssue[];
  };
}

export interface AppVersionIdNotMatching {
  name: "AppVersionIdNotMatching";
  details: {
    appId: string;
    latestVersionId: string;
    suppliedVersionId: string;
  };
}

export interface ArgumentsNotValid {
  name: "ArgumentsNotValid";
  details: {
    issues: ValidationIssue[];
  };
}

export interface CollectionNotFound {
  name: "CollectionNotFound";
  details: {
    collectionId: string;
  };
}

export interface ContentSummaryNotValid {
  name: "ContentSummaryNotValid";
  details: {
    collectionId: string;
    collectionVersionId: string;
    documentId: string;
    documentVersionId: string;
    issues: ValidationIssue[];
  };
}

export interface DocumentContentNotValid {
  name: "DocumentContentNotValid";
  details: {
    collectionId: string;
    collectionVersionId: string;
    documentId: string | null;
    issues: ValidationIssue[];
  };
}

export interface DocumentContentPatchNotValid {
  name: "DocumentContentPatchNotValid";
  details: {
    collectionId: string;
    documentId: string;
    latestVersionId: string;
    operationIndex: number | null;
    path: string | null;
    cause: string;
  };
}

export interface DocumentNotFound {
  name: "DocumentNotFound";
  details: {
    documentId: string;
  };
}

export interface DocumentVersionIdNotMatching {
  name: "DocumentVersionIdNotMatching";
  details: {
    documentId: string;
    latestVersionId: string;
    suppliedVersionId: string;
  };
}

export interface DuplicateDocumentDetected {
  name: "DuplicateDocumentDetected";
  details: {
    collectionId: string;
    duplicateDocument: Document;
  };
}

export interface ExecutingTypescriptFunctionFailed {
  name: "ExecutingTypescriptFunctionFailed";
  details: {
    message: string;
    name?: string | undefined;
    stack?: string | undefined;
  };
}

export interface FilesNotFound {
  name: "FilesNotFound";
  details: {
    fileIds: string[];
  };
}

export interface MakingContentBlockingKeysFailed {
  name: "MakingContentBlockingKeysFailed";
  details: {
    collectionId: string;
    collectionVersionId: string;
    documentId: string | null;
    cause:
      | {
          name: "ContentBlockingKeysNotValid";
          details: { contentBlockingKeys: any };
        }
      | ExecutingTypescriptFunctionFailed;
  };
}

export interface ReferencedDocumentsNotFound {
  name: "ReferencedDocumentsNotFound";
  details: {
    collectionId: string;
    /** The document being created or updated. Null for new documents. */
    documentId: string | null;
    /** DocumentRefs in the content that reference non-existing documents. */
    notFoundDocumentRefs: DocumentRef[];
  };
}

export interface UnexpectedError {
  name: "UnexpectedError";
  details: {
    cause: any;
  };
}

export type GetAppStateError =
  | AppNotFound
  | AppVersionIdNotMatching
  | ArgumentsNotValid
  | UnexpectedError;

export type UpdateAppStateError =
  | GetAppStateError
  | AppStateContentNotValid
  | AppStateRevisionNotMatching;

///////////
// Types //
///////////

export interface AppState<Content> {
  content: Content;
  revision: number;
}

export interface Document {
  id: string;
  collectionId: string;
  latestVersion: DocumentVersion;
  createdAt: Date;
}

export interface DocumentRef {
  collectionId: string;
  documentId: string;
}

export interface DocumentVersion {
  id: string;
  collectionVersionId: string;
  previousVersionId: string | null;
  conversationId: string | null;
  content: any;
  contentSummary:
    | {
        success: true;
        data: Record<string, string | number | boolean | null>;
        error: null;
      }
    | {
        success: false;
        data: null;
        error: ExecutingTypescriptFunctionFailed | ContentSummaryNotValid;
      };
  createdBy: "User" | "Migration" | "Assistant";
  createdAt: Date;
}

export interface ValidationIssue {
  message: string;
  path?: { key: string | number }[] | undefined;
}

///////////
// Hooks //
///////////

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
  error:
    | CollectionNotFound
    | DocumentContentNotValid
    | FilesNotFound
    | ReferencedDocumentsNotFound
    | MakingContentBlockingKeysFailed
    | DuplicateDocumentDetected
    | ArgumentsNotValid
    | UnexpectedError
    | null;
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
  error: ArgumentsNotValid | UnexpectedError | null;
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
  error:
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
    | null;
  data: null;
};

export declare function useAppState<Content = any>(): {
  data: AppState<Content> | undefined;
  error: GetAppStateError | null;
  isLoading: boolean;
  /** Reload saved state. Rejects with GetAppStateError on failure. */
  refetch(): Promise<void>;
};

export declare function useUpdateAppState<Content = any>(): {
  /** Replace app state content. Successful updates refresh useAppState. */
  mutate: (update: { latestRevision: number; content: Content }) => void;
  isIdle: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: UpdateAppStateError | null;
  data: null;
};
