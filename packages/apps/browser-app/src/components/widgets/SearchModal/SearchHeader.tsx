import type { RefObject } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";
import { useIntl } from "react-intl";
import Select from "../../design-system/forms/Select.js";
import SelectButton from "../../design-system/forms/SelectButton.js";
import type { Option } from "../../design-system/forms/SelectOptions.js";
import SelectOptions from "../../design-system/forms/SelectOptions.js";
import * as cs from "./SearchModal.css.js";

interface Props {
  query: string;
  onQueryChange: (query: string) => void;
  selectedCollectionId: string;
  onCollectionChange: (collectionId: string) => void;
  collectionOptions: Option[];
  inputRef: RefObject<HTMLInputElement | null>;
}

export default function SearchHeader({
  query,
  onQueryChange,
  selectedCollectionId,
  onCollectionChange,
  collectionOptions,
  inputRef,
}: Props) {
  const intl = useIntl();

  return (
    <div className={cs.SearchHeader.root}>
      <PiMagnifyingGlass className={cs.SearchHeader.searchIcon} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder={intl.formatMessage({
          defaultMessage: "Search documents...",
        })}
        className={cs.SearchHeader.input}
      />
      <Select
        selectedKey={selectedCollectionId}
        onSelectionChange={(key) => onCollectionChange(key as string)}
        aria-label={intl.formatMessage({
          defaultMessage: "Filter by collection",
        })}
        className={cs.SearchHeader.collectionSelect}
      >
        <SelectButton
          placeholder={intl.formatMessage({
            defaultMessage: "All collections",
          })}
          className={cs.SearchHeader.collectionSelectButton}
        />
        <SelectOptions options={collectionOptions} />
      </Select>
    </div>
  );
}
