import type { Collection, LiteDocument, TextSearchResult } from "@superego/backend";
import { FormattedMessage } from "react-intl";
import * as cs from "./SearchModal.css.js";
import SearchResultItem from "./SearchResultItem.js";

interface Props {
  results: TextSearchResult<LiteDocument>[];
  collectionsById: Record<string, Collection>;
  hasSearched: boolean;
  isPending: boolean;
  query: string;
  onResultClick: (result: TextSearchResult<LiteDocument>) => void;
}

export default function SearchResults({
  results,
  collectionsById,
  hasSearched,
  isPending,
  query,
  onResultClick,
}: Props) {
  if (!hasSearched && query.trim().length === 0) {
    return (
      <div className={cs.SearchResults.root}>
        <div className={cs.SearchResults.emptyState}>
          <FormattedMessage defaultMessage="Start typing to search" />
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className={cs.SearchResults.root}>
        <div className={cs.SearchResults.emptyState}>
          <FormattedMessage defaultMessage="Searching..." />
        </div>
      </div>
    );
  }

  if (results.length === 0 && hasSearched) {
    return (
      <div className={cs.SearchResults.root}>
        <div className={cs.SearchResults.emptyState}>
          <FormattedMessage defaultMessage="No results found" />
        </div>
      </div>
    );
  }

  return (
    <div className={cs.SearchResults.root}>
      {results.map((result) => (
        <SearchResultItem
          key={`${result.match.collectionId}-${result.match.id}`}
          result={result}
          collection={collectionsById[result.match.collectionId] ?? null}
          onClick={() => onResultClick(result)}
        />
      ))}
    </div>
  );
}
