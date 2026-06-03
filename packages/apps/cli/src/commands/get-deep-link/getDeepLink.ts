import type {
  AppId,
  CollectionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";

const PROTOCOL = "superego";

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
    }
  | {
      type: "app";
      appId: AppId;
    };

export interface GetDeepLinkArgs {
  resource: DeepLinkResource;
}

export default function getDeepLink({ resource }: GetDeepLinkArgs): string {
  return toDeepLink(toHref(resource));
}

function toDeepLink(href: string): string {
  return `${PROTOCOL}://${href}`;
}

function toHref(resource: DeepLinkResource): string {
  switch (resource.type) {
    case "document":
      return `/collections/${resource.collectionId}/documents/${resource.documentId}`;
    case "documentVersion":
      return `/collections/${resource.collectionId}/documents/${resource.documentId}/documentVersions/${resource.documentVersionId}`;
    case "collection":
      return `/collections/${resource.collectionId}`;
    case "app":
      return `/apps/${resource.appId}/edit`;
  }
}
