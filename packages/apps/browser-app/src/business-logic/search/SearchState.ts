import type {
  LiteConversation,
  LiteDocument,
  TextSearchResult,
} from "@superego/backend";
import type SearchType from "./SearchType.js";

type BaseSearchState<Match> =
  | {
      isSearching: false;
      results: null;
    }
  | {
      isSearching: true;
      results: TextSearchResult<Match>[] | null;
    }
  | {
      isSearching: false;
      results: TextSearchResult<Match>[];
    };

type SearchState =
  | ({
      searchType: SearchType.Documents;
    } & BaseSearchState<LiteDocument>)
  | ({
      searchType: SearchType.Conversations;
    } & BaseSearchState<LiteConversation>);
export default SearchState;
