import { Id } from "@superego/shared-utils";
import { expect, it } from "vitest";
import type Route from "./Route.js";
import { CollectionRouteView, RouteName } from "./Route.js";
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
  },
  {
    name: RouteName.Collection,
    collectionId: Id.generate.collection(),
    view: CollectionRouteView.Table,
  },
  {
    name: RouteName.Collection,
    collectionId: Id.generate.collection(),
    view: CollectionRouteView.App,
    appId: Id.generate.app(),
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
    name: RouteName.Document,
    collectionId: Id.generate.collection(),
    documentId: Id.generate.document(),
    showHistory: true,
  },
  {
    name: RouteName.Document,
    collectionId: Id.generate.collection(),
    documentId: Id.generate.document(),
    showHistory: false,
  },
  {
    name: RouteName.Document,
    collectionId: Id.generate.collection(),
    documentId: Id.generate.document(),
    documentVersionId: Id.generate.documentVersion(),
  },
  {
    name: RouteName.Document,
    collectionId: Id.generate.collection(),
    documentId: Id.generate.document(),
    documentVersionId: Id.generate.documentVersion(),
    showHistory: true,
  },
  {
    name: RouteName.Document,
    collectionId: Id.generate.collection(),
    documentId: Id.generate.document(),
    documentVersionId: Id.generate.documentVersion(),
    showHistory: false,
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

for (const testRoute of testRoutes) {
  const routeDisplayName =
    "view" in testRoute
      ? `route ${testRoute.name}, view ${testRoute.view}`
      : `route ${testRoute.name}`;
  it(`fromHref(toHref(${routeDisplayName})) = ${routeDisplayName}`, () => {
    expect(fromHref(toHref(testRoute))).toEqual(testRoute);
  });
}
