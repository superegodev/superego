import type { AppState } from "@superego/backend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type Backend from "../business-logic/backend/Backend.js";
import useBackend from "../business-logic/backend/useBackend.js";
import appStateQueryKey from "./appStateQueryKey.js";
import newestAppState from "./newestAppState.js";

type UpdateAppStateError = NonNullable<
  Awaited<ReturnType<Backend["updateState"]>>["error"]
>;

interface UseUpdateAppState<Content> {
  mutate: (update: { latestRevision: number; content: Content }) => void;
  isIdle: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: UpdateAppStateError | null;
  data: null;
}

export default function useUpdateAppState<
  Content = any,
>(): UseUpdateAppState<Content> {
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { mutate, isIdle, isPending, isError, isSuccess, error } = useMutation<
    null,
    UpdateAppStateError,
    { latestRevision: number; content: Content }
  >({
    mutationFn: async ({ latestRevision, content }) => {
      const result = await backend.updateState(latestRevision, content);
      if (!result.success) {
        throw result.error;
      }
      queryClient.setQueryData<AppState>(appStateQueryKey, (current) =>
        newestAppState(current, result.data),
      );
      return null;
    },
  });
  return {
    mutate,
    isIdle,
    isPending,
    isError,
    isSuccess,
    error,
    data: null,
  };
}
