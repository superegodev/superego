import type {
  AppHttpError,
  AppHttpRequest,
  AppHttpResponse,
} from "@superego/backend";
import type { ResultPromise } from "@superego/global-types";

/** Executes HTTP with the host-supplied destinations, including redirect checks. */
export default interface HttpExecutor {
  execute(
    request: AppHttpRequest,
    allowedOrigins: string[],
  ): ResultPromise<AppHttpResponse, AppHttpError>;
}
