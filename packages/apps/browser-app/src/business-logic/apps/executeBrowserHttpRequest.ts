import type { AppHttpResponse } from "@superego/backend";
import {
  appHttpFailure,
  appHttpRequestSchema,
  makeSuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";

const maximumBytes = 16 * 1024 * 1024;
/** Browser transport: exact origins and no automatic redirects or session credentials.
 * Fetch does not expose DNS/IP pinning, raw headers, or compressed wire bytes.
 */
export default async function executeBrowserHttpRequest(
  input: unknown,
  allowedOrigins: string[],
) {
  const parsed = v.safeParse(appHttpRequestSchema(), input);
  if (!parsed.success) {
    return appHttpFailure("InvalidArguments");
  }
  const request = parsed.output;
  const url = new URL(request.url);
  if (!allowedOrigins.includes(url.origin)) {
    return appHttpFailure("DestinationDenied");
  }
  const signal = AbortSignal.timeout(30_000);
  try {
    signal.throwIfAborted();
    const body = request.body
      ? request.body.encoding === "utf8"
        ? new TextEncoder().encode(request.body.data)
        : Uint8Array.from(atob(request.body.data), (character) =>
            character.charCodeAt(0),
          )
      : undefined;
    if (body && body.byteLength > maximumBytes) {
      return appHttpFailure("InvalidArguments");
    }
    const response = await fetch(url, {
      method: request.method ?? "GET",
      headers: request.headers ?? [],
      ...(body ? { body } : {}),
      mode: "cors",
      credentials: "omit",
      redirect: "error",
      referrerPolicy: "no-referrer",
      cache: "no-store",
      signal,
    });
    const chunks: string[] = [];
    let size = 0;
    const reader = response.body?.getReader();
    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          signal.throwIfAborted();
          if (done) {
            break;
          }
          size += value.byteLength;
          if (size > maximumBytes) {
            await reader.cancel();
            return appHttpFailure("TransportFailure");
          }
          // Keep string conversion bounded even when a response arrives in one chunk.
          for (let offset = 0; offset < value.length; offset += 8192) {
            chunks.push(
              String.fromCharCode(...value.subarray(offset, offset + 8192)),
            );
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
    signal.throwIfAborted();
    return makeSuccessfulResult<AppHttpResponse>({
      status: response.status,
      headers: [...response.headers.entries()],
      body: { encoding: "base64", data: btoa(chunks.join("")) },
      url: response.url || url.href,
    });
  } catch {
    return appHttpFailure("TransportFailure");
  }
}
