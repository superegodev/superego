import { Id } from "@superego/shared-utils";
import { expect, it } from "vitest";
import {
  fromDeepLink,
  toDeepLink,
  toHrefFromDeepLink,
} from "./DeepLinkUtils.js";
import { CollectionRouteView, RouteName } from "./Route.js";

it("creates and parses a document deep link", () => {
  // Exercise
  const route = {
    name: RouteName.Document,
    collectionId: Id.generate.collection(),
    documentId: Id.generate.document(),
  } as const;
  const deepLink = toDeepLink(route);
  const parsedRoute = fromDeepLink(deepLink);

  // Verify
  expect(deepLink).toEqual(
    `superego:///collections/${route.collectionId}/documents/${route.documentId}`,
  );
  expect(parsedRoute).toEqual(route);
});

it("creates and parses an app view deep link", () => {
  // Exercise
  const route = {
    name: RouteName.Collection,
    collectionId: Id.generate.collection(),
    view: CollectionRouteView.App,
    appId: Id.generate.app(),
  } as const;
  const deepLink = toDeepLink(route);
  const parsedRoute = fromDeepLink(deepLink);

  // Verify
  expect(deepLink).toEqual(
    `superego:///collections/${route.collectionId}?view=App&appId=${route.appId}`,
  );
  expect(parsedRoute).toEqual(route);
});

it("parses a manual deep link without an empty authority", () => {
  // Exercise
  const deepLink = "superego://collections/Collection_abc?view=Table";
  const href = toHrefFromDeepLink(deepLink);

  // Verify
  expect(href).toEqual("/collections/Collection_abc?view=Table");
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
  expect(route).toEqual({ name: RouteName.NotFound });
});
