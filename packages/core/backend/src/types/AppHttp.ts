import type { ResultError } from "@superego/global-types";

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
      | "TransportFailure";
  }
>;
