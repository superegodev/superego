import type { AppVersion } from "@superego/backend";
import { afterEach, describe, expect, it, vi } from "vitest";
import createBrowserHttpInstance from "./createBrowserHttpInstance.js";
import executeBrowserHttpRequest from "./executeBrowserHttpRequest.js";

afterEach(() => vi.unstubAllGlobals());
const origin = "https://example.com";
const signal = () => new AbortController().signal;

describe("browser app HTTP", () => {
  it("sends opaque bytes without session credentials and returns HTTP errors as responses", async () => {
    // Setup mocks
    const fetchRequest = vi
      .fn()
      .mockResolvedValue(
        new Response(new Uint8Array([0, 255, 128]), { status: 400 }),
      );
    vi.stubGlobal("fetch", fetchRequest);
    // Exercise
    const result = await executeBrowserHttpRequest(
      {
        url: `${origin}/request`,
        method: "POST",
        headers: [["Authorization", "Bearer app-token"]],
        body: { encoding: "base64", data: "AP+A" },
      },
      [origin],
      signal(),
    );
    // Verify
    expect(result.data).toMatchObject({
      status: 400,
      body: { encoding: "base64", data: "AP+A" },
    });
    expect(fetchRequest).toHaveBeenCalledWith(
      new URL(`${origin}/request`),
      expect.objectContaining({
        body: new Uint8Array([0, 255, 128]),
        credentials: "omit",
        redirect: "error",
        mode: "cors",
        referrerPolicy: "no-referrer",
      }),
    );
  });
  it("accepts arbitrary text and explicit local IP destinations", async () => {
    // Setup mocks
    const fetchRequest = vi.fn().mockResolvedValue(new Response("ok"));
    vi.stubGlobal("fetch", fetchRequest);
    // Exercise
    const result = await executeBrowserHttpRequest(
      {
        url: "http://127.0.0.1:9876/service",
        method: "POST",
        body: { encoding: "utf8", data: "not JSON; 😀" },
      },
      ["http://127.0.0.1:9876"],
      signal(),
    );
    // Verify
    expect(result.success).toBe(true);
    expect(fetchRequest.mock.calls[0]?.[1].body).toEqual(
      new TextEncoder().encode("not JSON; 😀"),
    );
  });
  it("rejects other origins, ports, routing headers and malformed arguments before fetching", async () => {
    // Setup mocks
    const fetchRequest = vi.fn();
    vi.stubGlobal("fetch", fetchRequest);
    // Exercise
    const denied = await executeBrowserHttpRequest(
      { url: "https://example.com:8443" },
      [origin],
      signal(),
    );
    const invalid = await executeBrowserHttpRequest(
      { url: origin, headers: [["Host", "other.example"]] },
      [origin],
      signal(),
    );
    const malformed = await executeBrowserHttpRequest(
      { url: origin, body: { encoding: "json", data: {} } },
      [origin],
      signal(),
    );
    // Verify
    expect(denied.error?.details.reason).toBe("DestinationDenied");
    expect(invalid.error?.details.reason).toBe("InvalidArguments");
    expect(malformed.error?.details.reason).toBe("InvalidArguments");
    expect(fetchRequest).not.toHaveBeenCalled();
  });
  it("sanitizes browser CORS, redirect and other transport failures", async () => {
    // Setup mocks
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("secret-url?token=secret")),
    );
    // Exercise
    const result = await executeBrowserHttpRequest(
      { url: origin },
      [origin],
      signal(),
    );
    // Verify
    expect(result.error).toEqual({
      name: "AppHttpError",
      details: { reason: "TransportFailure" },
    });
  });
  it("binds permissions to the stored version and cancels obsolete instances", async () => {
    // Setup mocks
    const fetchRequest = vi
      .fn()
      .mockImplementation(
        (_url, options) =>
          new Promise((_resolve, reject) =>
            options.signal.addEventListener("abort", () =>
              reject(new Error("Aborted")),
            ),
          ),
      );
    vi.stubGlobal("fetch", fetchRequest);
    // Setup SUT
    let version: AppVersion = {
      id: "AppVersion_first",
      targetCollections: [],
      files: { "/main.tsx": { source: "", compiled: "" } },
      createdAt: new Date(),
      permissions: { http: { allowedOrigins: [origin] } },
    };
    const instance = createBrowserHttpInstance(version.id, async () => version);
    // Exercise
    const request = instance.request({ url: origin });
    await vi.waitFor(() => expect(fetchRequest).toHaveBeenCalledOnce());
    version = { ...version, id: "AppVersion_second", permissions: {} };
    await instance.refresh();
    const aborted = await request;
    const obsolete = await instance.request({ url: origin });
    const replacement = createBrowserHttpInstance(
      version.id,
      async () => version,
    );
    const denied = await replacement.request({ url: origin });
    // Verify
    expect(aborted.error?.details.reason).toBe("ObsoleteInstance");
    expect(obsolete.error?.details.reason).toBe("ObsoleteInstance");
    expect(denied.error?.details.reason).toBe("DestinationDenied");
    expect(fetchRequest).toHaveBeenCalledOnce();
  });
});
