import type { CollectionId, DocumentId } from "@superego/backend";

export default interface AppComponentProps {
  collections: {
    [id: CollectionId]: {
      id: CollectionId;
      displayName: string;
      documents: {
        id: DocumentId;
        content: any;
      }[];
    };
  };
}
