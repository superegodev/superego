import type { CollectionId, DocumentId } from "@superego/backend";

export default interface AppComponentProps {
  collections: {
    id: CollectionId;
    name: string;
    /** If not null, a single emoji. */
    icon: string | null;
    documents: {
      id: DocumentId;
      content: any;
    }[];
  }[];
}
