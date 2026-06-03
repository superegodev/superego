import { Id } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import {
  fromDeepLink,
  toDeepLink,
  toHrefFromDeepLink,
} from "./DeepLinkUtils.js";
import { CollectionRouteView, RouteName } from "./Route.js";

describe("toDeepLink", () => {
  it("creates a document deep link", () => {
    // Exercise
    const deepLink = toDeepLink({
      name: RouteName.Document,
      collectionId: "Collection_111111111111111111111",
      documentId: "Document_111111111111111111111",
    });

    // Verify
    expect(deepLink).toEqual(
      "superego:///collections/Collection_111111111111111111111/documents/Document_111111111111111111111",
    );
  });

  it("creates an app view deep link", () => {
    // Exercise
    const deepLink = toDeepLink({
      name: RouteName.Collection,
      collectionId: "Collection_111111111111111111111",
      view: CollectionRouteView.App,
      appId: "App_111111111111111111111",
    });

    // Verify
    expect(deepLink).toEqual(
      "superego:///collections/Collection_111111111111111111111?view=App&appId=App_111111111111111111111",
    );
  });
});

describe("fromDeepLink", () => {
  it("parses a document deep link", () => {
    // Setup
    const route = {
      name: RouteName.Document,
      collectionId: Id.generate.collection(),
      documentId: Id.generate.document(),
    } as const;

    // Exercise
    const parsedRoute = fromDeepLink(toDeepLink(route));

    // Verify
    expect(parsedRoute).toEqual(route);
  });

  it("parses an app view deep link", () => {
    // Setup
    const route = {
      name: RouteName.Collection,
      collectionId: Id.generate.collection(),
      view: CollectionRouteView.App,
      appId: Id.generate.app(),
    } as const;

    // Exercise
    const parsedRoute = fromDeepLink(toDeepLink(route));

    // Verify
    expect(parsedRoute).toEqual(route);
  });

  it("rejects other protocols", () => {
    // Exercise
    const deepLink = "https://example.com/collections/Collection_abc";
    const route = fromDeepLink(deepLink);

    // Verify
    expect(route).toBeNull();
  });

  it("rejects malformed links", () => {
    // Exercise
    const deepLink = "not a url";
    const route = fromDeepLink(deepLink);

    // Verify
    expect(route).toBeNull();
  });

  it("parses unknown routes as not found", () => {
    // Exercise
    const route = fromDeepLink("superego:///unknown");

    // Verify
    expect(route).toEqual({ name: RouteName.NotFound, route: "/unknown" });
  });
});

describe("toHrefFromDeepLink", () => {
  it("parses a manual deep link without an empty authority", () => {
    // Exercise
    const deepLink = "superego://collections/Collection_abc?view=Table";
    const href = toHrefFromDeepLink(deepLink);

    // Verify
    expect(href).toEqual("/collections/Collection_abc?view=Table");
  });
});
