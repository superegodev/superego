import type { AppHttpRequest, AppHttpResponse } from "@superego/backend";
import { useMutation } from "@tanstack/react-query";
import type { AppHttpApiError } from "../business-logic/backend/Backend.js";
import useBackend from "../business-logic/backend/useBackend.js";
export default function useHttpRequest() {
  const backend = useBackend();
  return useMutation<AppHttpResponse, AppHttpApiError, AppHttpRequest>({
    mutationFn: async (request) => {
      const result = await backend.requestHttp(request);
      if (!result.success) {
        throw result.error;
      }
      return result.data;
    },
  });
}
