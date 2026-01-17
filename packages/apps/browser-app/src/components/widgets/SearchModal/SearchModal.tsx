import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useIntl } from "react-intl";
import useSearch from "../../../business-logic/search/useSearch.js";
import useSearchModalState from "../../../business-logic/search/useSearchModalState.js";
import * as cs from "./SearchModal.css.js";
import SearchParamsInput from "./SearchParamsInput.js";
import SearchResults from "./SearchResults.js";

export default function SearchModal() {
  const intl = useIntl();
  const { isOpen, close } = useSearchModalState();
  const { searchParams, setSearchParams, resetSearchParams, searchState } =
    useSearch();

  const handleClose = () => {
    close();
    resetSearchParams();
  };

  return (
    <ModalOverlay
      isDismissable={true}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
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
            onNavigateToSearchResult={handleClose}
          />
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
