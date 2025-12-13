import type {
  CollectionId,
  CollectionVersionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";

export default interface AppComponentProps {
  collections: {
    [id: CollectionId]: {
      id: CollectionId;
      versionId: CollectionVersionId;
      displayName: string;
      documents: {
        id: DocumentId;
        versionId: DocumentVersionId;
        href: string;
        content: any;
      }[];
    };
  };
}
