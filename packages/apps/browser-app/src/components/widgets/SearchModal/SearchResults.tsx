import { ListBox } from "react-aria-components";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import * as cs from "./SearchModal.css.js";
import SearchResult from "./SearchResult.js";
import type SearchState from "./SearchState.js";

interface Props {
  searchState: SearchState;
  onNavigateToSearchResult: () => void;
}
export default function SearchResults({
  searchState,
  onNavigateToSearchResult,
}: Props) {
  const intl = useIntl();
  const { collections } = useGlobalData();
  const collectionsById = CollectionUtils.makeByIdMap(collections);

  if (searchState.results === null) {
    return searchState.isSearching ? (
      <div className={cs.SearchResults.root}>
        <div className={cs.SearchResults.emptyState}>
          <FormattedMessage defaultMessage="Searching..." />
        </div>
      </div>
    ) : null;
  }

  if (searchState.results.length === 0) {
    return (
      <div className={cs.SearchResults.root}>
        <div className={cs.SearchResults.emptyState}>
          {searchState.isSearching ? (
            <FormattedMessage defaultMessage="Searching..." />
          ) : (
            <FormattedMessage defaultMessage="No results found" />
          )}
        </div>
      </div>
    );
  }

  return (
    <ListBox
      aria-label={intl.formatMessage({ defaultMessage: "Search results" })}
      selectionMode="none"
      className={cs.SearchResults.root}
      onAction={() => {
        onNavigateToSearchResult();
      }}
    >
      {searchState.results.map((result) => (
        <SearchResult
          key={result.match.id}
          result={result}
          collection={collectionsById[result.match.collectionId] ?? null}
        />
      ))}
    </ListBox>
  );
}
