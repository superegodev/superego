import type {
  CollectionId,
  CollectionNotFound,
  ConnectorDoesNotSupportUpSyncing,
  DocumentContentNotValid,
  FilesNotFound,
  UnexpectedError,
} from "@superego/backend";
import { useMutation } from "@tanstack/react-query";
import useBackend from "../business-logic/backend/useBackend.js";

interface UseCreateDocument {
  mutate: (collectionId: CollectionId, content: any) => void;
  isIdle: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error:
    | CollectionNotFound
    | ConnectorDoesNotSupportUpSyncing
    | DocumentContentNotValid
    | FilesNotFound
    | UnexpectedError
    | null;
  data: null;
}
export default function useCreateDocument(): UseCreateDocument {
  const backend = useBackend();
  const { mutate, isIdle, isPending, isError, isSuccess, error } = useMutation<
    null,
    | CollectionNotFound
    | ConnectorDoesNotSupportUpSyncing
    | DocumentContentNotValid
    | FilesNotFound
    | UnexpectedError,
    [collectionId: CollectionId, content: any]
  >({
    mutationFn: async (args) => {
      const result = await backend.createDocument(...args);
      if (result.error) {
        throw result.error;
      }
      return null;
    },
  });
  return {
    mutate: (collectionId: CollectionId, content: any) =>
      mutate([collectionId, content]),
    isIdle,
    isPending,
    isError,
    isSuccess,
    error,
    data: null,
  };
}
