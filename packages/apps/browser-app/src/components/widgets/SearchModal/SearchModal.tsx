import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useIntl } from "react-intl";
import useSearchModalState from "../../../business-logic/search/useSearchModalState.js";
import * as cs from "./SearchModal.css.js";
import SearchParamsInput from "./SearchParamsInput.jsx";
import SearchResults from "./SearchResults.js";
import useSearch from "./useSearch.js";

export default function SearchModal() {
  const intl = useIntl();
  const { isOpen, setIsOpen } = useSearchModalState();
  const { searchParams, setSearchParams, resetSearchParams, searchState } =
    useSearch();
  return (
    <ModalOverlay
      isDismissable={true}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      className={cs.SearchModal.overlay}
    >
      <Modal className={cs.SearchModal.modal}>
        <Dialog
          aria-label={intl.formatMessage({ defaultMessage: "Search" })}
          className={cs.SearchModal.dialog}
        >
          <SearchParamsInput value={searchParams} onChange={setSearchParams} />
          <SearchResults
            searchState={searchState}
            onNavigateToSearchResult={() => {
              setIsOpen(false);
              resetSearchParams();
            }}
          />
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
