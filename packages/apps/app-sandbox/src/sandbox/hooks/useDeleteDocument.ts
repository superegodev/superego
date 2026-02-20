import type {
  CollectionId,
  DocumentId,
  UnexpectedError,
} from "@superego/backend";
import { useMutation } from "@tanstack/react-query";
import useBackend from "../business-logic/backend/useBackend.js";

interface UseDeleteDocument {
  mutate: (collectionId: CollectionId, id: DocumentId) => void;
  isIdle: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: UnexpectedError | null;
  data: null;
}
export default function useDeleteDocument(): UseDeleteDocument {
  const backend = useBackend();
  const { mutate, isIdle, isPending, isError, isSuccess, error } = useMutation<
    null,
    UnexpectedError,
    [collectionId: CollectionId, id: DocumentId]
  >({
    mutationFn: async (args) => {
      const { data, error } = await backend.deleteDocument(...args);
      if (error) {
        throw error;
      }
      return data;
    },
  });
  return {
    mutate: (collectionId: CollectionId, id: DocumentId) =>
      mutate([collectionId, id]),
    isIdle,
    isPending,
    isError,
    isSuccess,
    error,
    data: null,
  };
}
