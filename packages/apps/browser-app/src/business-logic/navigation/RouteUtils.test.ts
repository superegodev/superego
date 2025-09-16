import { Id } from "@superego/shared-utils";
import { expect, it } from "vitest";
import type Route from "./Route.js";
import { RouteName } from "./Route.js";
import { fromHref, toHref } from "./RouteUtils.js";

const testRoutes: Route[] = [
  {
    name: RouteName.Assistant,
  },
  {
    name: RouteName.GlobalSettings,
  },
  {
    name: RouteName.CreateCollection,
  },
  {
    name: RouteName.CreateNewCollectionVersion,
    collectionId: Id.generate.collection(),
  },
  {
    name: RouteName.Collection,
    collectionId: Id.generate.collection(),
  },
  {
    name: RouteName.CollectionSettings,
    collectionId: Id.generate.collection(),
  },
  {
    name: RouteName.CreateDocument,
    collectionId: Id.generate.collection(),
  },
  {
    name: RouteName.Document,
    collectionId: Id.generate.collection(),
    documentId: Id.generate.document(),
  },
  {
    name: RouteName.Conversations,
  },
  {
    name: RouteName.Conversation,
    conversationId: Id.generate.conversation(),
  },
];

it.each(testRoutes)("fromHref(toHref(route $name)) = route $name", (route) => {
  expect(fromHref(toHref(route))).toEqual(route);
});
