import { useEffect, useRef, useState } from "react";
import useBackend from "../../../business-logic/backend/useBackend.js";
import type SearchParams from "./SearchParams.js";
import type SearchState from "./SearchState.js";

const initialSearchParams: SearchParams = {
  collectionId: null,
  query: "",
};
const initialSearchState: SearchState = { isSearching: false, results: null };

interface UseSearch {
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams) => void;
  resetSearchParams: () => void;
  searchState: SearchState;
}
export default function useSearch(): UseSearch {
  const backend = useBackend();
  const [searchParams, setSearchParams] = useState(initialSearchParams);
  const [searchState, setSearchState] = useState(initialSearchState);

  const latestSearchIdRef = useRef(0);
  useEffect(() => {
    if (searchParams.query.trim().length < 2) {
      setSearchState({ isSearching: false, results: null });
      return;
    }

    const timeoutId = setTimeout(async () => {
      const searchId = latestSearchIdRef.current + 1;
      latestSearchIdRef.current = searchId;
      setSearchState(({ results }) => ({ isSearching: true, results }));
      const searchResult = await backend.documents.search(
        searchParams.collectionId,
        searchParams.query,
        { limit: 20 },
      );
      if (searchId === latestSearchIdRef.current) {
        setSearchState({
          isSearching: false,
          results: searchResult.data ?? [],
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [backend, searchParams]);

  return {
    searchParams: searchParams,
    setSearchParams: setSearchParams,
    resetSearchParams: () => setSearchParams(initialSearchParams),
    searchState: searchState,
  };
}
