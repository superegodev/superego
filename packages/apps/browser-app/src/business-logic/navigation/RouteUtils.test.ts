import { Id } from "@superego/shared-utils";
import { expect, it } from "vitest";
import type Route from "./Route.js";
import { RouteName } from "./Route.js";
import { fromHref, toHref } from "./RouteUtils.js";

const testRoutes: Route[] = [
  {
    name: RouteName.Ask,
  },
  {
    name: RouteName.Conversations,
  },
  {
    name: RouteName.Conversation,
    conversationId: Id.generate.conversation(),
  },
  {
    name: RouteName.CreateCollectionAssisted,
  },
  {
    name: RouteName.CreateCollectionAssisted,
    initialMessage: "initialMessage",
  },
  {
    name: RouteName.CreateCollectionManual,
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
    name: RouteName.Collection,
    collectionId: Id.generate.collection(),
    activeAppId: Id.generate.app(),
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
    name: RouteName.CreateApp,
    collectionIds: [],
  },
  {
    name: RouteName.CreateApp,
    collectionIds: [Id.generate.collection()],
  },
  {
    name: RouteName.CreateApp,
    collectionIds: [Id.generate.collection(), Id.generate.collection()],
  },
  {
    name: RouteName.EditApp,
    appId: Id.generate.app(),
  },
  {
    name: RouteName.GlobalSettings,
  },
];

it.each(testRoutes)("fromHref(toHref(route $name)) = route $name", (route) => {
  expect(fromHref(toHref(route))).toEqual(route);
});
