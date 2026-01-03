import type { CollectionId } from "@superego/backend";
import type SearchType from "./SearchType.js";

export default interface SearchParams {
  searchType: SearchType;
  collectionId: CollectionId | null;
  query: string;
}
