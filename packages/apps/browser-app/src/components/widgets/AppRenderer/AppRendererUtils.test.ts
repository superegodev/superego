import type { App } from "@superego/backend";
import { makeSuccessfulResult } from "@superego/shared-utils";
import { describe, expect, it, vi } from "vitest";
import {
  invokeAllowedBackendMethod,
  isValidNavigationHref,
  makeStaticAppUrl,
  type StaticAppBridgeBackend,
} from "./AppRendererUtils.js";

describe("makeStaticAppUrl", () => {
  it("uses path segments instead of the hostname for case-sensitive ids", () => {
    // Setup SUT
    const app = {
      id: "App_UPPERCASE" as App["id"],
      latestVersion: {
        id: "AppVersion_UPPERCASE" as App["latestVersion"]["id"],
        entrypoint: "/dist/index.html",
      },
    } as App;

    // Exercise
    const url = makeStaticAppUrl(app);

    // Verify
    expect(url).toBe(
      "dev.superego.app://app/App_UPPERCASE/AppVersion_UPPERCASE/dist/index.html",
    );
  });
});

describe("invokeAllowedBackendMethod", () => {
  it("allows only the explicit bridge methods", async () => {
    // Setup SUT
    const backend: StaticAppBridgeBackend = {
      documents: {
        create: vi.fn((definition) => makeSuccessfulResult(definition)),
        createNewVersion: vi.fn(() => makeSuccessfulResult("new-version")),
        delete: vi.fn(() => makeSuccessfulResult(null)),
      },
      files: {
        getContent: vi.fn((id) => makeSuccessfulResult({ id })),
      },
    };

    // Exercise
    const allowedResult = await invokeAllowedBackendMethod(backend, {
      invocationId: "invocation",
      entity: "documents",
      method: "create",
      args: [{ collectionId: "Collection_1" }],
    });
    const rejectedResult = await invokeAllowedBackendMethod(backend, {
      invocationId: "invocation",
      entity: "collections",
      method: "delete",
      args: [],
    });
    const malformedResult = await invokeAllowedBackendMethod(backend, {
      invocationId: 1,
      entity: "documents",
      method: "create",
      args: [],
    });

    // Verify
    expect(allowedResult).toEqual(
      makeSuccessfulResult({ collectionId: "Collection_1" }),
    );
    expect(rejectedResult).toEqual(makeSuccessfulResult(null));
    expect(malformedResult).toEqual(makeSuccessfulResult(null));
    expect(backend.documents.create).toHaveBeenCalledOnce();
    expect(backend.documents.createNewVersion).not.toHaveBeenCalled();
    expect(backend.documents.delete).not.toHaveBeenCalled();
    expect(backend.files.getContent).not.toHaveBeenCalled();
  });
});

describe("isValidNavigationHref", () => {
  it("rejects external and unparseable navigation targets", () => {
    // Setup SUT
    const origin = "https://superego.local";

    // Exercise / Verify
    expect(isValidNavigationHref("/", origin)).toBe(true);
    expect(isValidNavigationHref("https://example.com/", origin)).toBe(false);
    expect(isValidNavigationHref("/not-a-real-route", origin)).toBe(false);
    expect(isValidNavigationHref(null, origin)).toBe(false);
  });
});
