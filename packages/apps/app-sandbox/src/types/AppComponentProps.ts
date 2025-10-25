import type {
  CollectionId,
  CollectionVersionId,
  DocumentId,
} from "@superego/backend";

export default interface AppComponentProps {
  collections: {
    [id: CollectionId]: {
      id: CollectionId;
      versionId: CollectionVersionId;
      displayName: string;
      documents: {
        id: DocumentId;
        content: any;
      }[];
    };
  };
}
