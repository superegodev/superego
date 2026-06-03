import type {
  AppId,
  CollectionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import { CollectionRouteView, RouteName, toDeepLink } from "@superego/routing";

type DeepLinkResource =
  | {
      type: "document";
      collectionId: CollectionId;
      documentId: DocumentId;
    }
  | {
      type: "documentVersion";
      collectionId: CollectionId;
      documentId: DocumentId;
      documentVersionId: DocumentVersionId;
    }
  | {
      type: "collection";
      collectionId: CollectionId;
      appId?: AppId;
    };

export interface GetDeepLinkArgs {
  resource: DeepLinkResource;
}

export default function getDeepLink({ resource }: GetDeepLinkArgs): string {
  switch (resource.type) {
    case "document":
      return toDeepLink({
        name: RouteName.Document,
        collectionId: resource.collectionId,
        documentId: resource.documentId,
      });
    case "documentVersion":
      return toDeepLink({
        name: RouteName.Document,
        collectionId: resource.collectionId,
        documentId: resource.documentId,
        documentVersionId: resource.documentVersionId,
      });
    case "collection":
      return toDeepLink(
        resource.appId
          ? {
              name: RouteName.Collection,
              collectionId: resource.collectionId,
              view: CollectionRouteView.App,
              appId: resource.appId,
            }
          : {
              name: RouteName.Collection,
              collectionId: resource.collectionId,
            },
      );
  }
}
