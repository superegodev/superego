import type { Backend } from "@superego/backend";
import {
  appHttpFailure,
  appHttpRequestSchema,
  httpOriginSchema,
} from "@superego/shared-utils";
import * as v from "valibot";
import * as structuralSchemas from "../../structural-schemas/index.js";
import BackendUsecase from "../../utils/BackendUsecase.js";

export default class AppsRequestHttp extends BackendUsecase<
  Backend["apps"]["requestHttp"]
> {
  static override readonly requiresTransaction = false;

  argumentsSchema = v.tuple([
    appHttpRequestSchema(),
    v.array(httpOriginSchema()),
  ]);
  resultSchema = structuralSchemas.global.result(
    structuralSchemas.backend.types.appHttpResponse(),
    [
      structuralSchemas.backend.errors.appHttpError(),
      structuralSchemas.backend.errors.unexpectedError(),
    ],
  );

  async exec(
    ...[request, allowedOrigins]: Parameters<Backend["apps"]["requestHttp"]>
  ) {
    if (!allowedOrigins.includes(new URL(request.url).origin)) {
      return appHttpFailure("DestinationDenied");
    }
    try {
      return await this.httpExecutor.execute(request, allowedOrigins);
    } catch {
      // Network errors must not expose request URLs, headers, or credentials.
      return appHttpFailure("TransportFailure");
    }
  }
}
