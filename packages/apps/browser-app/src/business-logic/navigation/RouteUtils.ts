import type {
  CollectionId,
  ConversationId,
  DocumentId,
} from "@superego/backend";
import type Route from "./Route.js";
import { RouteName } from "./Route.js";

export function toHref(route: Route): string {
  switch (route.name) {
    case RouteName.Ask:
      return "/";
    case RouteName.Conversations:
      return "/conversations";
    case RouteName.Conversation:
      return `/conversations/${route.conversationId}`;
    case RouteName.CreateCollectionAssisted:
      return "/collections/new/assisted";
    case RouteName.CreateCollectionManual:
      return "/collections/new/manual";
    case RouteName.CreateNewCollectionVersion:
      return `/collections/${route.collectionId}/newVersion`;
    case RouteName.Collection:
      return `/collections/${route.collectionId}`;
    case RouteName.CollectionSettings:
      return `/collections/${route.collectionId}/settings`;
    case RouteName.CreateDocument:
      return `/collections/${route.collectionId}/documents/new`;
    case RouteName.Document:
      return `/collections/${route.collectionId}/documents/${route.documentId}`;
    case RouteName.GlobalSettings:
      return "/settings";
  }
}

export function fromHref(href: string): Route {
  try {
    const url = new URL(href, location.origin);
    const pathname = url.pathname || "/";
    for (const matcher of routeMatchers) {
      const match = matcher.pattern.exec({ pathname });
      if (match) {
        return matcher.toRoute(match);
      }
    }
  } catch (error) {
    console.error(
      `Href ${href} cannot be converted into a Route object`,
      error,
    );
  }
  return { name: RouteName.Ask };
}

interface RouteMatcher {
  pattern: URLPattern;
  toRoute(match: URLPatternResult): Route;
}
const routeMatchers: RouteMatcher[] = [
  {
    pattern: new URLPattern({
      pathname: "/collections/:collectionId/documents/new{/}?",
    }),
    toRoute: (match) => ({
      name: RouteName.CreateDocument,
      collectionId: decodePathSegment<CollectionId>(
        match.pathname.groups["collectionId"],
      ),
    }),
  },
  {
    pattern: new URLPattern({
      pathname: "/collections/:collectionId/documents/:documentId{/}?",
    }),
    toRoute: (match) => ({
      name: RouteName.Document,
      collectionId: decodePathSegment<CollectionId>(
        match.pathname.groups["collectionId"],
      ),
      documentId: decodePathSegment<DocumentId>(
        match.pathname.groups["documentId"],
      ),
    }),
  },
  {
    pattern: new URLPattern({
      pathname: "/collections/:collectionId/settings{/}?",
    }),
    toRoute: (match) => ({
      name: RouteName.CollectionSettings,
      collectionId: decodePathSegment<CollectionId>(
        match.pathname.groups["collectionId"],
      ),
    }),
  },
  {
    pattern: new URLPattern({
      pathname: "/collections/:collectionId/newVersion{/}?",
    }),
    toRoute: (match) => ({
      name: RouteName.CreateNewCollectionVersion,
      collectionId: decodePathSegment<CollectionId>(
        match.pathname.groups["collectionId"],
      ),
    }),
  },
  {
    pattern: new URLPattern({ pathname: "/collections/new/assisted{/}?" }),
    toRoute: () => ({ name: RouteName.CreateCollectionAssisted }),
  },
  {
    pattern: new URLPattern({ pathname: "/collections/new/manual{/}?" }),
    toRoute: () => ({ name: RouteName.CreateCollectionManual }),
  },
  {
    pattern: new URLPattern({ pathname: "/collections/:collectionId{/}?" }),
    toRoute: (match) => ({
      name: RouteName.Collection,
      collectionId: decodePathSegment<CollectionId>(
        match.pathname.groups["collectionId"],
      ),
    }),
  },
  {
    pattern: new URLPattern({
      pathname: "/conversations/:conversationId{/}?",
    }),
    toRoute: (match) => ({
      name: RouteName.Conversation,
      conversationId: decodePathSegment<ConversationId>(
        match.pathname.groups["conversationId"],
      ),
    }),
  },
  {
    pattern: new URLPattern({ pathname: "/conversations{/}?" }),
    toRoute: () => ({ name: RouteName.Conversations }),
  },
  {
    pattern: new URLPattern({ pathname: "/settings{/}?" }),
    toRoute: () => ({ name: RouteName.GlobalSettings }),
  },
  {
    pattern: new URLPattern({ pathname: "/" }),
    toRoute: () => ({ name: RouteName.Ask }),
  },
];

function decodePathSegment<Segment extends string>(
  value: string | undefined,
): Segment {
  if (value === undefined) {
    throw new Error("Missing path segment");
  }
  try {
    return decodeURIComponent(value) as Segment;
  } catch {
    return value as Segment;
  }
}
