import type { AppHttpRequest } from "@superego/backend";
import type { HttpExecutor } from "@superego/executing-backend";
import { appHttpFailure, makeSuccessfulResult } from "@superego/shared-utils";
import { DestinationDenied } from "./destinationPolicy.js";
import executeHttpRequest from "./executeHttpRequest.js";

export default class NodejsHttpExecutor implements HttpExecutor {
  async execute(
    request: AppHttpRequest,
    allowedOrigins: string[],
  ): ReturnType<HttpExecutor["execute"]> {
    try {
      return makeSuccessfulResult(
        await executeHttpRequest(
          request,
          allowedOrigins,
          AbortSignal.timeout(30_000),
        ),
      );
    } catch (error) {
      return appHttpFailure(
        error instanceof DestinationDenied
          ? "DestinationDenied"
          : "TransportFailure",
      );
    }
  }
}
