import type { AppHttpRequest, AppHttpResponse } from "@superego/backend";
import { useCallback } from "react";
import useBackend from "../business-logic/backend/useBackend.js";

export default function useHttpRequest(): (
  request: AppHttpRequest,
) => Promise<AppHttpResponse> {
  const backend = useBackend();
  return useCallback(
    async (request: AppHttpRequest) => {
      const result = await backend.requestHttp(request);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
    [backend],
  );
}
