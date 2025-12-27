import type {
  CollectionId,
  LiteDocument,
  TextSearchResult,
} from "@superego/backend";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { useSearchDocuments } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import useSearchModalState from "../../../business-logic/search/useSearchModalState.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import SearchHeader from "./SearchHeader.js";
import * as cs from "./SearchModal.css.js";
import SearchResults from "./SearchResults.js";

const ALL_COLLECTIONS_KEY = "__all__";

export default function SearchModal() {
  const intl = useIntl();
  const { isOpen, close } = useSearchModalState();
  const { navigateTo } = useNavigationState();
  const { collections } = useGlobalData();
  const { mutate: search, isPending } = useSearchDocuments();

  const [query, setQuery] = useState("");
  const [selectedCollectionId, setSelectedCollectionId] =
    useState<string>(ALL_COLLECTIONS_KEY);
  const [results, setResults] = useState<TextSearchResult<LiteDocument>[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const collectionsById = useMemo(
    () => CollectionUtils.makeByIdMap(collections),
    [collections],
  );

  const collectionOptions = useMemo(
    () => [
      {
        id: ALL_COLLECTIONS_KEY,
        label: intl.formatMessage({ defaultMessage: "All collections" }),
      },
      ...collections.map((collection) => ({
        id: collection.id,
        label: CollectionUtils.getDisplayName(collection),
      })),
    ],
    [collections, intl],
  );

  const performSearch = useCallback(
    async (searchQuery: string, collectionId: string) => {
      if (searchQuery.trim().length === 0) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      const collectionIdToSearch =
        collectionId === ALL_COLLECTIONS_KEY
          ? null
          : (collectionId as CollectionId);

      const result = await search(collectionIdToSearch, searchQuery.trim());
      if (result.success) {
        setResults(result.data);
      } else {
        setResults([]);
      }
      setHasSearched(true);
    },
    [search],
  );

  const handleQueryChange = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        performSearch(newQuery, selectedCollectionId);
      }, 300);
    },
    [performSearch, selectedCollectionId],
  );

  const handleCollectionChange = useCallback(
    (collectionId: string) => {
      setSelectedCollectionId(collectionId);
      if (query.trim().length > 0) {
        performSearch(query, collectionId);
      }
    },
    [performSearch, query],
  );

  const handleResultClick = useCallback(
    (result: TextSearchResult<LiteDocument>) => {
      navigateTo({
        name: RouteName.Document,
        collectionId: result.match.collectionId,
        documentId: result.match.id,
      });
      close();
    },
    [navigateTo, close],
  );

  const handleOpenChange = useCallback(
    (newIsOpen: boolean) => {
      if (!newIsOpen) {
        close();
      }
    },
    [close],
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setSelectedCollectionId(ALL_COLLECTIONS_KEY);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ModalOverlay
      isDismissable={true}
      isOpen={isOpen}
      onOpenChange={handleOpenChange}
      className={cs.SearchModal.overlay}
    >
      <Modal className={cs.SearchModal.modal}>
        <Dialog aria-label={intl.formatMessage({ defaultMessage: "Search" })}>
          <SearchHeader
            query={query}
            onQueryChange={handleQueryChange}
            selectedCollectionId={selectedCollectionId}
            onCollectionChange={handleCollectionChange}
            collectionOptions={collectionOptions}
            inputRef={inputRef}
          />
          <SearchResults
            results={results}
            collectionsById={collectionsById}
            hasSearched={hasSearched}
            isPending={isPending}
            query={query}
            onResultClick={handleResultClick}
          />
          <div className={cs.SearchModal.keyboard}>
            <kbd className={cs.SearchModal.kbd}>{"Esc"}</kbd>
            <FormattedMessage defaultMessage="to close" />
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
