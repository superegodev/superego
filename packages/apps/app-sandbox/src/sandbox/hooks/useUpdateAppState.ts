import type { AppState } from "@superego/backend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppStateApiError } from "../business-logic/backend/Backend.js";
import useBackend from "../business-logic/backend/useBackend.js";
import newestAppState from "./newestAppState.js";

export default function useUpdateAppState<
  Content extends Record<string, unknown> = Record<string, unknown>,
>() {
  const backend = useBackend();
  const queryClient = useQueryClient();
  return useMutation<
    AppState<Content>,
    AppStateApiError,
    { expectedRevision: number; content: Content }
  >({
    mutationFn: async ({ expectedRevision, content }) => {
      const result = await backend.updateState(expectedRevision, content);
      if (!result.success) {
        throw result.error;
      }
      queryClient.setQueryData<AppState>(backend.stateQueryKey, (current) =>
        newestAppState(current, result.data),
      );
      return result.data as AppState<Content>;
    },
  });
}
