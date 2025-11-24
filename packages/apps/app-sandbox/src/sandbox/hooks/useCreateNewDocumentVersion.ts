import type {
  CollectionId,
  CollectionNotFound,
  ConnectorDoesNotSupportUpSyncing,
  DocumentContentNotValid,
  DocumentId,
  DocumentNotFound,
  DocumentVersionId,
  DocumentVersionIdNotMatching,
  FilesNotFound,
  UnexpectedError,
} from "@superego/backend";
import { useMutation } from "@tanstack/react-query";
import useBackend from "../business-logic/backend/useBackend.js";

interface UseCreateNewDocumentVersion {
  mutate: (
    collectionId: CollectionId,
    id: DocumentId,
    latestVersionId: DocumentVersionId,
    content: any,
  ) => void;
  isIdle: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error:
    | CollectionNotFound
    | DocumentNotFound
    | ConnectorDoesNotSupportUpSyncing
    | DocumentVersionIdNotMatching
    | DocumentContentNotValid
    | FilesNotFound
    | UnexpectedError
    | null;
  data: null;
}
export default function useCreateNewDocumentVersion(): UseCreateNewDocumentVersion {
  const backend = useBackend();
  const { mutate, isIdle, isPending, isError, isSuccess, error } = useMutation<
    null,
    | CollectionNotFound
    | DocumentNotFound
    | ConnectorDoesNotSupportUpSyncing
    | DocumentVersionIdNotMatching
    | DocumentContentNotValid
    | FilesNotFound
    | UnexpectedError,
    [
      collectionId: CollectionId,
      id: DocumentId,
      latestVersionId: DocumentVersionId,
      content: any,
    ]
  >({
    mutationFn: async (args) => {
      const result = await backend.createNewDocumentVersion(...args);
      if (result.error) {
        throw result.error;
      }
      return null;
    },
  });
  return {
    mutate: (
      collectionId: CollectionId,
      id: DocumentId,
      latestVersionId: DocumentVersionId,
      content: any,
    ) => mutate([collectionId, id, latestVersionId, content]),
    isIdle,
    isPending,
    isError,
    isSuccess,
    error,
    data: null,
  };
}
