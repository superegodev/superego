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
      | "ConnectorDoesNotSupportUpSyncing"
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
