import type {
  Collection,
  CollectionId,
  DocumentId,
  LiteDocument,
  TextSearchResult,
} from "@superego/backend";
import type { DocumentRef, DocumentRefTypeDefinition } from "@superego/schema";
import { useState } from "react";
import {
  Autocomplete,
  Input,
  ListBox,
  SearchField,
} from "react-aria-components";
import { type Control, useController } from "react-hook-form";
import { PiMagnifyingGlass } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import SearchType from "../../../../business-logic/search/SearchType.js";
import useSearch from "../../../../business-logic/search/useSearch.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import classnames from "../../../../utils/classnames.js";
import { FieldError } from "../../../design-system/forms/forms.js";
import Select from "../../../design-system/forms/Select.js";
import Popover from "../../../design-system/Popover/Popover.js";
import { DocumentSearchResult } from "../../../design-system/SearchResult/SearchResult.js";
import AnyFieldLabel from "../AnyFieldLabel.js";
import NullifyFieldAction from "../NullifyFieldAction.js";
import * as cs from "../RHFContentField.css.js";
import { useUiOptions } from "../uiOptions.js";
import SelectButton from "./SelectButton.js";

interface Props {
  typeDefinition: DocumentRefTypeDefinition;
  isNullable: boolean;
  isListItem: boolean;
  control: Control;
  name: string;
  label: string;
}
export default function DocumentRefField({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const intl = useIntl();
  const { isReadOnly, protoCollections } = useUiOptions();
  const { field, fieldState } = useController({ control, name });

  const { collections } = useGlobalData();
  const collectionsById = CollectionUtils.makeByIdMap([
    ...collections,
    ...(protoCollections as Collection[]),
  ]);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const closePopover = () => {
    setIsPopoverOpen(false);
    resetSearchParams();
  };

  const { searchParams, setSearchParams, resetSearchParams, searchState } =
    useSearch();

  return (
    <Select
      id={field.name}
      name={field.name}
      value={field.value ? getIdFromDocumentRef(field.value) : null}
      onChange={(selectedId) => {
        field.onChange(
          selectedId ? getDocumentRefFromId(selectedId as string) : null,
        );
      }}
      validationBehavior="aria"
      isInvalid={fieldState.invalid}
      aria-label={isListItem ? label : undefined}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      data-testid="widgets.RHFContentField.DocumentRefField.root"
      className={classnames(cs.Field.root, isListItem && cs.ListItemField.root)}
    >
      {!isListItem ? (
        <AnyFieldLabel
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          label={label}
          actions={
            isReadOnly ? null : (
              <NullifyFieldAction
                isNullable={isNullable}
                field={field}
                fieldLabel={label}
              />
            )
          }
        />
      ) : null}
      <SelectButton
        onPress={() => setIsPopoverOpen(true)}
        value={field.value}
        collectionsById={collectionsById}
        isReadOnly={isReadOnly}
      />
      <FieldError>{fieldState.error?.message}</FieldError>
      <Popover
        className={cs.DocumentRefField.DocumentRefField.popover}
        isOpen={isPopoverOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closePopover();
          }
        }}
      >
        <Autocomplete>
          <SearchField
            value={searchParams.query}
            onChange={(query) =>
              setSearchParams({
                searchType: SearchType.Documents,
                collectionId:
                  (typeDefinition.collectionId as CollectionId | undefined) ??
                  null,
                query: query,
              })
            }
            autoFocus={true}
            aria-label={intl.formatMessage({
              defaultMessage: "Search documents",
            })}
            className={cs.DocumentRefField.DocumentRefField.searchField}
          >
            <PiMagnifyingGlass
              className={cs.DocumentRefField.DocumentRefField.searchFieldIcon}
            />
            <Input
              placeholder={intl.formatMessage({
                defaultMessage: "Search documents",
              })}
              className={cs.DocumentRefField.DocumentRefField.searchFieldInput}
            />
          </SearchField>
          <ListBox
            aria-label={intl.formatMessage({
              defaultMessage: "Search results",
            })}
            items={(
              (searchState.results as TextSearchResult<LiteDocument>[]) ?? []
            ).map((result) => ({
              id: getIdFromSearchResult(result),
              result: result,
            }))}
            renderEmptyState={() => (
              <div className={cs.DocumentRefField.DocumentRefField.emptyState}>
                {searchState.results === null ? (
                  <FormattedMessage defaultMessage="Type to search" />
                ) : searchState.isSearching ? (
                  <FormattedMessage defaultMessage="Searching..." />
                ) : (
                  <FormattedMessage defaultMessage="No results found" />
                )}
              </div>
            )}
            className={cs.DocumentRefField.DocumentRefField.listBox}
          >
            {(item) => (
              <DocumentSearchResult
                key={item.id}
                id={item.id}
                result={item.result}
                collection={
                  collectionsById[item.result.match.collectionId] ?? null
                }
                onPress={closePopover}
              />
            )}
          </ListBox>
        </Autocomplete>
      </Popover>
    </Select>
  );
}

function getIdFromSearchResult(result: TextSearchResult<LiteDocument>): string {
  return `${result.match.collectionId}:${result.match.id}`;
}

function getIdFromDocumentRef(documentRef: DocumentRef): string {
  return `${documentRef.collectionId}:${documentRef.documentId}`;
}

function getDocumentRefFromId(id: string): DocumentRef {
  const [collectionId, documentId] = id.split(":") as [
    CollectionId,
    DocumentId,
  ];
  return { collectionId, documentId };
}
