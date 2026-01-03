import { useEffect, useRef, useState } from "react";
import useBackend from "../../../business-logic/backend/useBackend.js";
import type SearchParams from "./SearchParams.js";
import type SearchState from "./SearchState.js";
import SearchType from "./SearchType.js";

const initialSearchParams: SearchParams = {
  searchType: SearchType.Documents,
  collectionId: null,
  query: "",
};
const initialSearchState: SearchState = {
  searchType: SearchType.Documents,
  isSearching: false,
  results: null,
};

interface UseSearch {
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams) => void;
  resetSearchParams: () => void;
  searchState: SearchState;
}
export default function useSearch(): UseSearch {
  const backend = useBackend();
  const [searchParams, setSearchParams] = useState(initialSearchParams);
  const [searchState, setSearchState] =
    useState<SearchState>(initialSearchState);

  const latestSearchIdRef = useRef(0);
  useEffect(() => {
    if (searchParams.query.trim().length < 2) {
      setSearchState({
        searchType: searchParams.searchType,
        isSearching: false,
        results: null,
      });
      return;
    }

    const timeoutId = setTimeout(async () => {
      const searchId = latestSearchIdRef.current + 1;
      latestSearchIdRef.current = searchId;

      if (searchParams.searchType === SearchType.Documents) {
        setSearchState((prev) =>
          prev.searchType === SearchType.Documents
            ? { ...prev, isSearching: true }
            : {
                searchType: SearchType.Documents,
                isSearching: true,
                results: null,
              },
        );
        const searchResult = await backend.documents.search(
          searchParams.collectionId,
          searchParams.query,
          { limit: 10 },
        );
        if (searchId === latestSearchIdRef.current) {
          setSearchState({
            searchType: SearchType.Documents,
            isSearching: false,
            results: searchResult.data ?? [],
          });
        }
      } else {
        setSearchState((prev) =>
          prev.searchType === SearchType.Conversations
            ? { ...prev, isSearching: true }
            : {
                searchType: SearchType.Conversations,
                isSearching: true,
                results: null,
              },
        );
        const searchResult = await backend.assistants.searchConversations(
          searchParams.query,
          { limit: 10 },
        );
        if (searchId === latestSearchIdRef.current) {
          setSearchState({
            searchType: SearchType.Conversations,
            isSearching: false,
            results: searchResult.data ?? [],
          });
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    backend,
    searchParams.searchType,
    searchParams.collectionId,
    searchParams.query,
  ]);

  return {
    searchParams: searchParams,
    setSearchParams: setSearchParams,
    resetSearchParams: () => setSearchParams(initialSearchParams),
    searchState: searchState,
  };
}
