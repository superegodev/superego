import type { Milliseconds } from "@superego/global-types";
import { useEffect, useState } from "react";
import { ListBox } from "react-aria-components";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import type SearchState from "../../../business-logic/search/SearchState.js";
import SearchType from "../../../business-logic/search/SearchType.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import {
  ConversationSearchResult,
  DocumentSearchResult,
} from "../../design-system/SearchResult/SearchResult.js";
import * as cs from "./SearchModal.css.js";

const searchingIndicatorDelay: Milliseconds = 500;

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

  const [showSearchingIndicator, setShowSearchingIndicator] = useState(false);
  useEffect(() => {
    if (searchState.isSearching) {
      const timeoutId = setTimeout(
        () => setShowSearchingIndicator(true),
        searchingIndicatorDelay,
      );
      return () => clearTimeout(timeoutId);
    }
    setShowSearchingIndicator(false);
    return;
  }, [searchState.isSearching]);

  if (searchState.results === null) {
    return showSearchingIndicator ? (
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
          {showSearchingIndicator ? (
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
      {searchState.searchType === SearchType.Documents
        ? searchState.results.map((result) => (
            <DocumentSearchResult
              key={result.match.id}
              result={result}
              collection={collectionsById[result.match.collectionId] ?? null}
              href={toHref({
                name: RouteName.Document,
                collectionId: result.match.collectionId,
                documentId: result.match.id,
              })}
            />
          ))
        : searchState.results.map((result) => (
            <ConversationSearchResult key={result.match.id} result={result} />
          ))}
    </ListBox>
  );
}
