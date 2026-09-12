import type {
  OnBeforeSendHeadersListenerDetails,
  OnHeadersReceivedListenerDetails,
} from "electron";

export function isAppSandboxRequest(
  details: Pick<
    OnBeforeSendHeadersListenerDetails,
    "frame" | "resourceType" | "url"
  >,
  hostUrl: string,
): boolean {
  const { frame } = details;
  if (!frame || frame.isDestroyed()) {
    return false;
  }
  return (
    details.resourceType === "xhr" &&
    /^https?:\/\//.test(details.url) &&
    frame.url.split("#")[0] ===
      "dev.superego.app-sandbox://localhost/app-sandbox.html" &&
    frame.parent === frame.top &&
    frame.parent?.url.split("#")[0] === hostUrl
  );
}

export interface CorsRequest {
  origin: string;
  method: string | undefined;
  headers: string | undefined;
}

export function getCorsRequest(
  details: Pick<
    OnBeforeSendHeadersListenerDetails,
    "method" | "requestHeaders"
  >,
): CorsRequest | null {
  const headers = new Headers(details.requestHeaders);
  const origin = headers.get("origin");
  if (!origin) {
    return null;
  }
  return {
    origin,
    method:
      details.method === "OPTIONS"
        ? (headers.get("access-control-request-method") ?? undefined)
        : undefined,
    headers: headers.get("access-control-request-headers") ?? undefined,
  };
}

export function makeCorsResponse(
  request: CorsRequest,
  originalHeaders: OnHeadersReceivedListenerDetails["responseHeaders"],
): { responseHeaders: Record<string, string[]>; statusLine?: string } {
  const responseHeaders = Object.fromEntries(
    Object.entries(originalHeaders ?? {}).filter(
      ([name]) => !name.toLowerCase().startsWith("access-control-"),
    ),
  );
  responseHeaders["Access-Control-Allow-Origin"] = [request.origin];
  responseHeaders["Access-Control-Allow-Credentials"] = ["true"];
  if (request.method) {
    responseHeaders["Access-Control-Allow-Methods"] = [request.method];
    if (request.headers) {
      responseHeaders["Access-Control-Allow-Headers"] = [request.headers];
    }
    responseHeaders["Access-Control-Max-Age"] = ["0"];
    // APIs commonly return 404/405 for OPTIONS despite accepting the fetch.
    return { responseHeaders, statusLine: "HTTP/1.1 200 OK" };
  }
  responseHeaders["Access-Control-Expose-Headers"] = [
    Object.keys(responseHeaders).join(", "),
  ];
  return { responseHeaders };
}
