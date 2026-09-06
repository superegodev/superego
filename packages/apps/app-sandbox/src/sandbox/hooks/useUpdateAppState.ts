import type { AppState } from "@superego/backend";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import useBackend from "../business-logic/backend/useBackend.js";
import newestAppState from "./newestAppState.js";

export default function useUpdateAppState<
  Content extends Record<string, unknown> = Record<string, unknown>,
>(): (update: {
  expectedRevision: number;
  content: Content;
}) => Promise<AppState<Content>> {
  const backend = useBackend();
  const queryClient = useQueryClient();
  return useCallback(
    async ({
      expectedRevision,
      content,
    }: {
      expectedRevision: number;
      content: Content;
    }) => {
      const result = await backend.updateState(expectedRevision, content);
      if (!result.success) {
        throw result.error;
      }
      queryClient.setQueryData<AppState>(backend.stateQueryKey, (current) =>
        newestAppState(current, result.data),
      );
      return result.data as AppState<Content>;
    },
    [backend, queryClient],
  );
}
