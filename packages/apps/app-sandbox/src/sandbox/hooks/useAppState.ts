import type { AppState } from "@superego/backend";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { AppStateApiError } from "../business-logic/backend/Backend.js";
import useBackend from "../business-logic/backend/useBackend.js";
import newestAppState from "./newestAppState.js";

export default function useAppState<Content = Record<string, unknown>>() {
  const backend = useBackend();
  const queryClient = useQueryClient();
  useEffect(
    () =>
      backend.onStateChanged(() => {
        void queryClient.invalidateQueries({ queryKey: backend.stateQueryKey });
      }),
    [backend, queryClient],
  );
  return useQuery<AppState<Content>, AppStateApiError>({
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
    refetchOnWindowFocus: "always",
    retry: false,
  });
}
