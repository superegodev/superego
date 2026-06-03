import { Id } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import getDeepLink from "./getDeepLink.js";

describe("getDeepLink", () => {
  it("creates a document deep link", () => {
    // Setup
    const collectionId = Id.generate.collection();
    const documentId = Id.generate.document();

    // Exercise
    const deepLink = getDeepLink({
      resource: { type: "document", collectionId, documentId },
    });

    // Verify
    expect(deepLink).toEqual(
      `superego:///collections/${collectionId}/documents/${documentId}`,
    );
  });

  it("creates a document version deep link", () => {
    // Setup
    const collectionId = Id.generate.collection();
    const documentId = Id.generate.document();
    const documentVersionId = Id.generate.documentVersion();

    // Exercise
    const deepLink = getDeepLink({
      resource: {
        type: "documentVersion",
        collectionId,
        documentId,
        documentVersionId,
      },
    });

    // Verify
    expect(deepLink).toEqual(
      `superego:///collections/${collectionId}/documents/${documentId}/documentVersions/${documentVersionId}`,
    );
  });

  it("creates a collection deep link", () => {
    // Setup
    const collectionId = Id.generate.collection();

    // Exercise
    const deepLink = getDeepLink({
      resource: { type: "collection", collectionId },
    });

    // Verify
    expect(deepLink).toEqual(`superego:///collections/${collectionId}`);
  });

  it("creates a collection app view deep link", () => {
    // Setup
    const collectionId = Id.generate.collection();
    const appId = Id.generate.app();

    // Exercise
    const deepLink = getDeepLink({
      resource: { type: "collection", collectionId, appId },
    });

    // Verify
    expect(deepLink).toEqual(
      `superego:///collections/${collectionId}?view=App&appId=${appId}`,
    );
  });
});
