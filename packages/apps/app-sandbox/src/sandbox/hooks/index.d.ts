export declare function useCreateDocument(): {
  /** Create a **new document**. */
  mutate: (
    collectionId: CollectionId,
    /** Full content of the document. */
    content: any,
  ) => void;
  isIdle: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: {
    name:
      | "CollectionNotFound"
      | "ConnectorDoesNotSupportUpSyncing"
      | "DocumentContentNotValid"
      | "FilesNotFound"
      | "UnexpectedError";
    details: any;
  } | null;
  data: null;
};

export declare function useCreateNewDocumentVersion(): {
  /** Create a **new immutable version** of an existing document. */
  mutate: (
    collectionId: CollectionId,
    id: DocumentId,
    /**
     * Latest known version at the time of the update. Used for optimistic
     * concurrency check.
     */
    latestVersionId: DocumentVersionId,
    /** Full content for the new version (complete replace, not a patch). */
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
      | "ConnectorDoesNotSupportUpSyncing"
      | "DocumentVersionIdNotMatching"
      | "DocumentContentNotValid"
      | "FilesNotFound"
      | "UnexpectedError";
    details: any;
  } | null;
  data: null;
};
