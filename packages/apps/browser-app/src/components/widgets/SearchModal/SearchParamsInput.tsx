import type { CollectionId } from "@superego/backend";
import {
  Input,
  SearchField,
  ToggleButton,
  ToggleButtonGroup,
} from "react-aria-components";
import { PiMagnifyingGlass } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import type SearchParams from "../../../business-logic/search/SearchParams.js";
import SearchType from "../../../business-logic/search/SearchType.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import Select from "../../design-system/forms/Select.js";
import SelectButton from "../../design-system/forms/SelectButton.js";
import SelectOptions from "../../design-system/forms/SelectOptions.js";
import * as cs from "./SearchModal.css.js";

const nullOptionId = "null";

interface Props {
  value: SearchParams;
  onChange: (value: SearchParams) => void;
}
export default function SearchParamsInput({ value, onChange }: Props) {
  const intl = useIntl();
  const { collections } = useGlobalData();
  return (
    <div className={cs.SearchParamsInput.root}>
      <div className={cs.SearchParamsInput.searchFieldRow}>
        <SearchField
          value={value.query}
          onChange={(query) => onChange({ ...value, query })}
          autoFocus={true}
          aria-label={intl.formatMessage({ defaultMessage: "Search" })}
          className={cs.SearchParamsInput.searchField}
        >
          <PiMagnifyingGlass className={cs.SearchParamsInput.searchIcon} />
          <Input
            placeholder={intl.formatMessage({ defaultMessage: "Search" })}
            className={cs.SearchParamsInput.input}
          />
        </SearchField>
      </div>
      <div className={cs.SearchParamsInput.filtersRow}>
        <ToggleButtonGroup
          selectionMode="single"
          selectedKeys={[value.searchType]}
          disallowEmptySelection={true}
          onSelectionChange={(keys) => {
            const searchType = [...keys][0] as SearchType;
            onChange({
              ...value,
              searchType,
              collectionId:
                searchType === SearchType.Conversations
                  ? null
                  : value.collectionId,
            });
          }}
          className={cs.SearchParamsInput.toggleButtonGroup}
        >
          <ToggleButton
            id={SearchType.Documents}
            className={cs.SearchParamsInput.toggleButton}
          >
            {intl.formatMessage({ defaultMessage: "Documents" })}
          </ToggleButton>
          <ToggleButton
            id={SearchType.Conversations}
            className={cs.SearchParamsInput.toggleButton}
          >
            {intl.formatMessage({ defaultMessage: "Conversations" })}
          </ToggleButton>
        </ToggleButtonGroup>
        {value.searchType === SearchType.Documents && (
          <Select
            value={value.collectionId ?? nullOptionId}
            onChange={(optionId) =>
              onChange({
                ...value,
                collectionId:
                  optionId === nullOptionId ? null : (optionId as CollectionId),
              })
            }
            aria-label={intl.formatMessage({
              defaultMessage: "Filter by collection",
            })}
            className={cs.SearchParamsInput.collectionSelect}
          >
            <SelectButton
              placeholder={intl.formatMessage({
                defaultMessage: "All collections",
              })}
              className={cs.SearchParamsInput.collectionSelectButton}
            />
            <SelectOptions
              className={cs.SearchParamsInput.collectionSelectOptions}
              options={[
                {
                  id: nullOptionId,
                  label: intl.formatMessage({
                    defaultMessage: "All collections",
                  }),
                },
                ...collections.map((collection) => ({
                  id: collection.id,
                  label: CollectionUtils.getDisplayName(collection),
                })),
              ]}
            />
          </Select>
        )}
      </div>
    </div>
  );
}
