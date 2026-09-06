import type {
  OnBeforeSendHeadersListenerDetails,
  WebFrameMain,
} from "electron";
import { describe, expect, it } from "vitest";
import {
  getCorsRequest,
  isAppSandboxRequest,
  makeCorsResponse,
} from "./appSandboxCors.js";

const hostUrl = "file:///superego/renderer/index.html";
function appRequest() {
  const parent = { url: hostUrl } as WebFrameMain;
  const frame = {
    url: "dev.superego.app-sandbox://localhost/app-sandbox.html",
    parent,
    top: parent,
    isDestroyed: () => false,
  } as WebFrameMain;
  return {
    frame,
    resourceType: "xhr",
    url: "https://api.example.com/data",
  } satisfies Pick<
    OnBeforeSendHeadersListenerDetails,
    "frame" | "resourceType" | "url"
  >;
}

describe("app sandbox request attribution", () => {
  it("accepts a direct app iframe of the trusted host", () => {
    // Exercise
    const result = isAppSandboxRequest(appRequest(), hostUrl);
    // Verify
    expect(result).toBe(true);
  });

  it("keeps attribution when the host uses hash routing", () => {
    // Setup SUT
    const details = appRequest();
    const parent = { url: `${hostUrl}#/apps/App_example` } as WebFrameMain;
    details.frame = { ...details.frame, parent, top: parent } as WebFrameMain;
    // Exercise
    const result = isAppSandboxRequest(details, hostUrl);
    // Verify
    expect(result).toBe(true);
  });

  it.each([
    "missing frame",
    "destroyed frame",
    "host request",
    "unrelated frame",
    "nested frame",
    "untrusted host",
    "navigation",
    "non-HTTP",
    "other sandbox path",
  ])("rejects %s", (scenario) => {
    // Setup SUT
    const details: Pick<
      OnBeforeSendHeadersListenerDetails,
      "frame" | "resourceType" | "url"
    > = appRequest();
    switch (scenario) {
      case "missing frame":
        details.frame = null;
        break;
      case "destroyed frame":
        details.frame = {
          ...details.frame,
          isDestroyed: () => true,
        } as WebFrameMain;
        break;
      case "host request":
        details.frame = { ...details.frame, url: hostUrl } as WebFrameMain;
        break;
      case "unrelated frame":
        details.frame = {
          ...details.frame,
          url: "https://example.com",
        } as WebFrameMain;
        break;
      case "nested frame":
        details.frame = { ...details.frame, parent: {} } as WebFrameMain;
        break;
      case "untrusted host": {
        const parent = { url: "file:///other.html" } as WebFrameMain;
        details.frame = {
          ...details.frame,
          parent,
          top: parent,
        } as WebFrameMain;
        break;
      }
      case "navigation":
        details.resourceType = "subFrame";
        break;
      case "non-HTTP":
        details.url = "file:///secret";
        break;
      case "other sandbox path":
        details.frame = {
          ...details.frame,
          url: "dev.superego.app-sandbox://localhost/other.html",
        } as WebFrameMain;
        break;
    }
    // Exercise
    const result = isAppSandboxRequest(details, hostUrl);
    // Verify
    expect(result).toBe(false);
  });
});

describe("app sandbox CORS headers", () => {
  it("handles preflight status, requested methods and headers case-insensitively", () => {
    // Setup SUT
    const request = getCorsRequest({
      method: "OPTIONS",
      requestHeaders: {
        origin: "dev.superego.app-sandbox://localhost",
        "access-control-request-method": "PATCH",
        "Access-Control-Request-Headers":
          "authorization,content-type,x-app-header",
      },
    });
    // Exercise
    const response = makeCorsResponse(request!, {
      "access-control-allow-origin": ["https://other.example.com"],
      "ACCESS-CONTROL-ALLOW-HEADERS": ["wrong"],
      "Content-Type": ["text/plain"],
    });
    // Verify
    expect(response).toEqual({
      statusLine: "HTTP/1.1 200 OK",
      responseHeaders: {
        "Content-Type": ["text/plain"],
        "Access-Control-Allow-Origin": ["dev.superego.app-sandbox://localhost"],
        "Access-Control-Allow-Credentials": ["true"],
        "Access-Control-Allow-Methods": ["PATCH"],
        "Access-Control-Allow-Headers": [
          "authorization,content-type,x-app-header",
        ],
        "Access-Control-Max-Age": ["0"],
      },
    });
  });

  it.each(["GET", "POST", "OPTIONS"])(
    "preserves actual %s status and exposes response headers",
    (method) => {
      // Setup SUT
      const request = getCorsRequest({
        method,
        requestHeaders: { Origin: "null" },
      });
      // Exercise
      const response = makeCorsResponse(request!, {
        "X-Service-Header": ["value"],
      });
      // Verify
      expect(response.statusLine).toBeUndefined();
      expect(response.responseHeaders["X-Service-Header"]).toEqual(["value"]);
      expect(response.responseHeaders["Access-Control-Allow-Origin"]).toEqual([
        "null",
      ]);
      expect(
        response.responseHeaders["Access-Control-Expose-Headers"]?.[0],
      ).toContain("X-Service-Header");
      expect(
        response.responseHeaders["Access-Control-Allow-Methods"],
      ).toBeUndefined();
    },
  );

  it("ignores requests without an Origin header", () => {
    // Exercise
    const request = getCorsRequest({ method: "GET", requestHeaders: {} });
    // Verify
    expect(request).toBeNull();
  });
});
