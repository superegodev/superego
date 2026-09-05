import type { ResultError, ResultPromise } from "@superego/global-types";
import type AppId from "../ids/AppId.js";
import type AppVersionId from "../ids/AppVersionId.js";

/** Text is encoded as UTF-8; binary is canonical padded RFC 4648 base64. */
export type AppHttpBody = { encoding: "utf8" | "base64"; data: string };
export interface AppHttpRequest {
  url: string;
  method?: string | undefined;
  headers?: [string, string][] | undefined;
  body?: AppHttpBody | undefined;
}
export interface AppHttpResponse {
  status: number;
  headers: [string, string][];
  body: { encoding: "base64"; data: string };
  url: string;
}
export type AppHttpError = ResultError<
  "AppHttpError",
  {
    reason:
      | "DestinationDenied"
      | "UnsupportedRuntime"
      | "InvalidArguments"
      | "TransportFailure"
      | "ObsoleteInstance";
  }
>;
/** Used only by the trusted host; tokens and version claims never enter the iframe. */
export interface AppHttpRuntime {
  open(
    appId: AppId,
    versionId: AppVersionId,
  ): ResultPromise<string, AppHttpError>;
  request(
    instanceId: string,
    request: AppHttpRequest,
  ): ResultPromise<AppHttpResponse, AppHttpError>;
  close(instanceId: string): Promise<void>;
  onAppsChanged(callback: () => void): () => void;
}
