import type { CollectionId } from "@superego/backend";

export default interface SearchParams {
  collectionId: CollectionId | null;
  query: string;
}
