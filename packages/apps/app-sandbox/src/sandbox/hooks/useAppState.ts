import type { AppState } from "@superego/backend";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { GetAppStateError } from "../business-logic/backend/Backend.js";
import useBackend from "../business-logic/backend/useBackend.js";
import newestAppState from "./newestAppState.js";

interface UseAppState<Content> {
  data: AppState<Content> | undefined;
  error: GetAppStateError | null;
  isLoading: boolean;
  refetch(): Promise<void>;
}

export default function useAppState<Content = any>(): UseAppState<Content> {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { data, error, isLoading, refetch } = useQuery<
    AppState<Content>,
    GetAppStateError
  >({
    queryKey: backend.stateQueryKey,
    queryFn: async () => {
      const result = await backend.getState();
      if (!result.success) {
        throw result.error;
      }
      return newestAppState(
        queryClient.getQueryData(backend.stateQueryKey),
        result.data,
      ) as AppState<Content>;
    },
    retry: false,
  });
  return {
    data,
    error,
    isLoading,
    refetch: async () => {
      await refetch({ throwOnError: true });
    },
  };
}
