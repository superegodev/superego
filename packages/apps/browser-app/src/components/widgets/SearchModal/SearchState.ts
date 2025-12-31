import type { LiteDocument, TextSearchResult } from "@superego/backend";

type SearchState =
  | {
      isSearching: false;
      results: null;
    }
  | {
      isSearching: true;
      results: TextSearchResult<LiteDocument>[] | null;
    }
  | {
      isSearching: false;
      results: TextSearchResult<LiteDocument>[];
    };
export default SearchState;
