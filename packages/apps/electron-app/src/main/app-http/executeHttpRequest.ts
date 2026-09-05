import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import type { AppHttpRequest, AppHttpResponse } from "@superego/backend";
import {
  authorizeDestination,
  DestinationDenied,
} from "./destinationPolicy.js";

const maximumBytes = 16 * 1024 * 1024;
/** No browser session, cookie jar, proxy, shared agent, or automatic redirect handling. */
export default async function executeHttpRequest(
  input: AppHttpRequest,
  allowedOrigins: string[],
  signal: AbortSignal,
  assertCurrent: () => Promise<void>,
): Promise<AppHttpResponse> {
  let url = new URL(input.url);
  let method = input.method ?? "GET";
  let headers = input.headers ?? [];
  let body = input.body
    ? Buffer.from(
        input.body.data,
        input.body.encoding === "utf8" ? "utf8" : "base64",
      )
    : undefined;
  if (body && body.length > maximumBytes) {
    throw new Error("Request too large");
  }
  for (let redirects = 0; redirects <= 5; redirects++) {
    await assertCurrent();
    signal.throwIfAborted();
    const destination = await authorizeDestination(url, allowedOrigins);
    await assertCurrent();
    signal.throwIfAborted();
    const response = await new Promise<{
      status: number;
      headers: [string, string][];
      body: Buffer;
      location?: string | undefined;
    }>((resolve, reject) => {
      const request = (url.protocol === "https:" ? httpsRequest : httpRequest)(
        url,
        {
          method,
          headers: [
            "Host",
            url.host,
            "Connection",
            "close",
            ...(body ? ["Content-Length", String(body.length)] : []),
            ...headers.flat(),
          ],
          agent: false,
          family: destination.family,
          signal,
          // The URL retains the original authority for Host and TLS verification/SNI.
          lookup: (_hostname, _options, callback) =>
            callback(null, destination.address, destination.family),
          rejectUnauthorized: true,
        },
        (response) => {
          const responseHeaders: [string, string][] = [];
          for (let i = 0; i < response.rawHeaders.length; i += 2) {
            responseHeaders.push([
              response.rawHeaders[i]!,
              response.rawHeaders[i + 1]!,
            ]);
          }
          const status = response.statusCode ?? 0;
          const location = response.headers.location;
          if ([301, 302, 303, 307, 308].includes(status) && location) {
            response.destroy();
            resolve({
              status,
              headers: responseHeaders,
              body: Buffer.alloc(0),
              location,
            });
            return;
          }
          const chunks: Buffer[] = [];
          let size = 0;
          response.on("data", (chunk: Buffer) => {
            size += chunk.length;
            if (size > maximumBytes) {
              response.destroy(new Error("Response too large"));
            } else {
              chunks.push(chunk);
            }
          });
          response.on("error", reject);
          response.on("end", () =>
            resolve({
              status,
              headers: responseHeaders,
              body: Buffer.concat(chunks),
            }),
          );
        },
      );
      request.on("error", reject);
      request.end(body);
    });
    if (!response.location) {
      return {
        status: response.status,
        headers: response.headers,
        body: { encoding: "base64", data: response.body.toString("base64") },
        url: url.href,
      };
    }
    if (redirects === 5) {
      throw new Error("Redirect limit exceeded");
    }
    const nextUrl = new URL(response.location, url);
    // Never forward app headers across origins. In particular this drops auth,
    // cookies and service-specific API keys, whose names the host cannot know.
    if (nextUrl.origin !== url.origin) {
      headers = [];
    }
    if (
      (response.status === 303 && method !== "HEAD") ||
      ([301, 302].includes(response.status) && method === "POST")
    ) {
      method = "GET";
      body = undefined;
      headers = headers.filter(([name]) => !/^content-/i.test(name));
    }
    // Each hop is authorized before its DNS lookup or connection, including bodies.
    if (!allowedOrigins.includes(nextUrl.origin)) {
      throw new DestinationDenied();
    }
    url = nextUrl;
  }
  throw new Error("Redirect limit exceeded");
}
