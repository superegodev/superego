import type {
  CollectionNotFound,
  ConnectorDoesNotSupportUpSyncing,
  DocumentContentNotValid,
  DocumentDefinition,
  FilesNotFound,
  UnexpectedError,
} from "@superego/backend";
import { useMutation } from "@tanstack/react-query";
import useBackend from "../business-logic/backend/useBackend.js";

interface UseCreateDocument {
  mutate: (definition: DocumentDefinition) => void;
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
    DocumentDefinition
  >({
    mutationFn: async (definition) => {
      const result = await backend.createDocument(definition);
      if (result.error) {
        throw result.error;
      }
      return null;
    },
  });
  return {
    mutate: (definition: DocumentDefinition) => mutate(definition),
    isIdle,
    isPending,
    isError,
    isSuccess,
    error,
    data: null,
  };
}
