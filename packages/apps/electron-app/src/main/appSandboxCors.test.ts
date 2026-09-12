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

  describe("rejects requests outside the app sandbox", () => {
    it("case: missing frame", () => {
      // Setup SUT
      const details: Pick<
        OnBeforeSendHeadersListenerDetails,
        "frame" | "resourceType" | "url"
      > = appRequest();
      details.frame = null;
      // Exercise
      const result = isAppSandboxRequest(details, hostUrl);
      // Verify
      expect(result).toBe(false);
    });

    it("case: destroyed frame", () => {
      // Setup SUT
      const details: Pick<
        OnBeforeSendHeadersListenerDetails,
        "frame" | "resourceType" | "url"
      > = appRequest();
      details.frame = {
        ...details.frame,
        isDestroyed: () => true,
      } as WebFrameMain;
      // Exercise
      const result = isAppSandboxRequest(details, hostUrl);
      // Verify
      expect(result).toBe(false);
    });

    it("case: host request", () => {
      // Setup SUT
      const details: Pick<
        OnBeforeSendHeadersListenerDetails,
        "frame" | "resourceType" | "url"
      > = appRequest();
      details.frame = { ...details.frame, url: hostUrl } as WebFrameMain;
      // Exercise
      const result = isAppSandboxRequest(details, hostUrl);
      // Verify
      expect(result).toBe(false);
    });

    it("case: unrelated frame", () => {
      // Setup SUT
      const details: Pick<
        OnBeforeSendHeadersListenerDetails,
        "frame" | "resourceType" | "url"
      > = appRequest();
      details.frame = {
        ...details.frame,
        url: "https://example.com",
      } as WebFrameMain;
      // Exercise
      const result = isAppSandboxRequest(details, hostUrl);
      // Verify
      expect(result).toBe(false);
    });

    it("case: nested frame", () => {
      // Setup SUT
      const details: Pick<
        OnBeforeSendHeadersListenerDetails,
        "frame" | "resourceType" | "url"
      > = appRequest();
      details.frame = { ...details.frame, parent: {} } as WebFrameMain;
      // Exercise
      const result = isAppSandboxRequest(details, hostUrl);
      // Verify
      expect(result).toBe(false);
    });

    it("case: untrusted host", () => {
      // Setup SUT
      const details: Pick<
        OnBeforeSendHeadersListenerDetails,
        "frame" | "resourceType" | "url"
      > = appRequest();
      const parent = { url: "file:///other.html" } as WebFrameMain;
      details.frame = { ...details.frame, parent, top: parent } as WebFrameMain;
      // Exercise
      const result = isAppSandboxRequest(details, hostUrl);
      // Verify
      expect(result).toBe(false);
    });

    it("case: navigation", () => {
      // Setup SUT
      const details: Pick<
        OnBeforeSendHeadersListenerDetails,
        "frame" | "resourceType" | "url"
      > = appRequest();
      details.resourceType = "subFrame";
      // Exercise
      const result = isAppSandboxRequest(details, hostUrl);
      // Verify
      expect(result).toBe(false);
    });

    it("case: non-HTTP", () => {
      // Setup SUT
      const details: Pick<
        OnBeforeSendHeadersListenerDetails,
        "frame" | "resourceType" | "url"
      > = appRequest();
      details.url = "file:///secret";
      // Exercise
      const result = isAppSandboxRequest(details, hostUrl);
      // Verify
      expect(result).toBe(false);
    });

    it("case: other sandbox path", () => {
      // Setup SUT
      const details: Pick<
        OnBeforeSendHeadersListenerDetails,
        "frame" | "resourceType" | "url"
      > = appRequest();
      details.frame = {
        ...details.frame,
        url: "dev.superego.app-sandbox://localhost/other.html",
      } as WebFrameMain;
      // Exercise
      const result = isAppSandboxRequest(details, hostUrl);
      // Verify
      expect(result).toBe(false);
    });
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

  describe("preserves actual request status and exposes response headers", () => {
    it("case: GET", () => {
      // Setup SUT
      const request = getCorsRequest({
        method: "GET",
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
    });

    it("case: POST", () => {
      // Setup SUT
      const request = getCorsRequest({
        method: "POST",
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
    });

    it("case: OPTIONS", () => {
      // Setup SUT
      const request = getCorsRequest({
        method: "OPTIONS",
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
    });
  });

  it("ignores requests without an Origin header", () => {
    // Exercise
    const request = getCorsRequest({ method: "GET", requestHeaders: {} });
    // Verify
    expect(request).toBeNull();
  });
});
