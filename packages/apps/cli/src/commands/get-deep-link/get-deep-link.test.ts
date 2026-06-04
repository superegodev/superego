import type { AppId, CollectionId } from "@superego/backend";
import { describe, expect, it } from "vitest";
import { getDeepLink } from "./get-deep-link.js";

describe("getDeepLink", () => {
  it("keeps sensitive route data in the URL fragment by default", () => {
    // Exercise
    const deepLink = getDeepLink({
      resource: {
        type: "collection",
        collectionId: "Collection_abc" as CollectionId,
        appId: "App_abc" as AppId,
      },
    });

    // Verify
    expect(deepLink).toBe(
      "https://open.superego.dev/#deepLink=superego%3A%2F%2F%2Fcollections%2FCollection_abc%3Fview%3DApp%26appId%3DApp_abc",
    );
  });

  it("returns desktop deep links when requested", () => {
    // Exercise
    const deepLink = getDeepLink({
      linkFormat: "desktop",
      resource: {
        type: "collection",
        collectionId: "Collection_abc" as CollectionId,
        appId: "App_abc" as AppId,
      },
    });

    // Verify
    expect(deepLink).toBe(
      "superego:///collections/Collection_abc?view=App&appId=App_abc",
    );
  });
});
