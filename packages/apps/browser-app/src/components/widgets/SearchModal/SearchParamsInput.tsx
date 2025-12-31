import type { CollectionId } from "@superego/backend";
import { Input, SearchField } from "react-aria-components";
import { PiMagnifyingGlass } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import Select from "../../design-system/forms/Select.js";
import SelectButton from "../../design-system/forms/SelectButton.js";
import SelectOptions from "../../design-system/forms/SelectOptions.js";
import * as cs from "./SearchModal.css.js";
import type SearchParams from "./SearchParams.js";

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
      <SearchField
        value={value.query}
        onChange={(query) => onChange({ ...value, query })}
        autoFocus={true}
        aria-label={intl.formatMessage({
          defaultMessage: "Search documents",
        })}
        className={cs.SearchParamsInput.searchField}
      >
        <PiMagnifyingGlass className={cs.SearchParamsInput.searchIcon} />
        <Input
          placeholder={intl.formatMessage({
            defaultMessage: "Search documents...",
          })}
          className={cs.SearchParamsInput.input}
        />
      </SearchField>
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
              label: intl.formatMessage({ defaultMessage: "All collections" }),
            },
            ...collections.map((collection) => ({
              id: collection.id,
              label: CollectionUtils.getDisplayName(collection),
            })),
          ]}
        />
      </Select>
    </div>
  );
}
