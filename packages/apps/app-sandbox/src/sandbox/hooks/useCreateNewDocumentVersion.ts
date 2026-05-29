import type {
  CollectionId,
  CollectionNotFound,
  DocumentContentPatchNotValid,
  DocumentContentNotValid,
  DocumentId,
  DocumentNotFound,
  DocumentVersionId,
  DocumentVersionIdNotMatching,
  DocumentContentChange,
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
    contentChange: DocumentContentChange,
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
    | DocumentVersionIdNotMatching
    | DocumentContentPatchNotValid
    | DocumentContentNotValid
    | FilesNotFound
    | UnexpectedError,
    [
      collectionId: CollectionId,
      id: DocumentId,
      latestVersionId: DocumentVersionId,
      contentChange: DocumentContentChange,
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
      contentChange: DocumentContentChange,
    ) => mutate([collectionId, id, latestVersionId, contentChange]),
    isIdle,
    isPending,
    isError,
    isSuccess,
    error,
    data: null,
  };
}
