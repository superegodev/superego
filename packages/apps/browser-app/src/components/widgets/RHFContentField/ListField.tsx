import type { ListTypeDefinition, Schema } from "@superego/schema";
import {
  type Control,
  useController,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { PiBackspace, PiCaretDown, PiCaretUp, PiPlus } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import forms from "../../../business-logic/forms/forms.js";
import toTitleCase from "../../../utils/toTitleCase.js";
import Button from "../../design-system/Button/Button.js";
import FieldLabel from "../../design-system/FieldLabel/FieldLabel.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import AnyField from "./AnyField.js";
import AnyFieldLabel from "./AnyFieldLabel.js";
import NullifyFieldAction from "./NullifyFieldAction.js";
import * as cs from "./RHFContentField.css.js";
import { useUiOptions } from "./uiOptions.js";
import useFieldUiOptions from "./useFieldUiOptions.js";

interface Props {
  schema: Schema;
  typeDefinition: ListTypeDefinition;
  isNullable: boolean;
  isListItem: boolean;
  control: Control;
  name: string;
  label: string;
}
export default function ListField(props: Props) {
  const value = useWatch({ control: props.control, name: props.name });
  const Component = value === null ? NullListField : NonNullListField;
  return <Component {...props} />;
}

function NullListField({
  schema,
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { isReadOnly } = useUiOptions();
  const { field } = useController({ control, name });
  const { allowCollapsing } = useFieldUiOptions(name);
  return (
    <Fieldset
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      data-testid="widgets.RHFContentField.ListField.root"
      className={cs.Field.root}
      isDisclosureDisabled={allowCollapsing === false}
    >
      <AnyFieldLabel
        component="legend"
        typeDefinition={typeDefinition}
        isNullable={isNullable}
        label={label}
        name={name}
      />
      <Fieldset.Fields className={cs.StructAndListField.nullValueFields}>
        {isReadOnly ? (
          <span className={cs.StructAndListField.nullValueSetValueButton}>
            <FormattedMessage defaultMessage="null" />
          </span>
        ) : (
          <Button
            onPress={() =>
              field.onChange(
                forms.defaults.typeDefinitionValue(typeDefinition, schema),
              )
            }
            className={cs.StructAndListField.nullValueSetValueButton}
          >
            <FormattedMessage defaultMessage="null - click to set a value" />
          </Button>
        )}
      </Fieldset.Fields>
    </Fieldset>
  );
}

function NonNullListField({
  schema,
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { isReadOnly } = useUiOptions();
  const intl = useIntl();
  const { field } = useController({ control, name });
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const { allowCollapsing } = useFieldUiOptions(name);
  return (
    <Fieldset
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      data-testid="widgets.RHFContentField.ListField.root"
      className={cs.Field.root}
      isDisclosureDisabled={allowCollapsing === false}
    >
      <AnyFieldLabel
        component="legend"
        typeDefinition={typeDefinition}
        isNullable={isNullable}
        label={label}
        name={name}
        actions={
          !isReadOnly ? (
            <>
              <NullifyFieldAction
                isNullable={isNullable}
                field={field}
                fieldLabel={label}
              />
              <FieldLabel.Action
                label={intl.formatMessage({ defaultMessage: "Add item" })}
                onPress={() =>
                  append({
                    value: forms.defaults.typeDefinitionValue(
                      typeDefinition.items,
                      schema,
                    ),
                  })
                }
              >
                <PiPlus />
              </FieldLabel.Action>
            </>
          ) : undefined
        }
      />
      <Fieldset.Fields>
        {fields.length === 0 ? (
          <div className={cs.ListField.emptyItemsPlaceholder}>
            <FormattedMessage defaultMessage="There are no items in the list" />
          </div>
        ) : null}
        {fields.map((item, index) => (
          <ItemField
            key={item.id}
            schema={schema}
            typeDefinition={typeDefinition}
            control={control}
            name={`${name}.${index}.value`}
            itemIndex={index}
            isFirstItem={index === 0}
            isLastItem={index === fields.length - 1}
            isReadOnly={isReadOnly}
            onRemoveItem={() => remove(index)}
            onMoveItemUp={() => move(index, index - 1)}
            onMoveItemDown={() => move(index, index + 1)}
          />
        ))}
      </Fieldset.Fields>
    </Fieldset>
  );
}

interface ItemFieldProps {
  schema: Schema;
  typeDefinition: ListTypeDefinition;
  control: Control;
  name: string;
  itemIndex: number;
  isFirstItem: boolean;
  isLastItem: boolean;
  isReadOnly: boolean;
  onRemoveItem: () => void;
  onMoveItemUp: () => void;
  onMoveItemDown: () => void;
}
function ItemField({
  schema,
  typeDefinition,
  control,
  name,
  itemIndex,
  isFirstItem,
  isLastItem,
  isReadOnly,
  onRemoveItem,
  onMoveItemUp,
  onMoveItemDown,
}: ItemFieldProps) {
  const intl = useIntl();
  return (
    <div className={cs.ListField.item}>
      {!isReadOnly && (
        <div className={cs.ListField.itemActions}>
          <IconButton
            onPress={onRemoveItem}
            variant="invisible"
            label={intl.formatMessage({ defaultMessage: "Delete" })}
            tooltipPlacement="left"
            tooltipCloseDelay={0}
            className={cs.ListField.itemAction}
          >
            <PiBackspace />
          </IconButton>
          {!isLastItem ? (
            <IconButton
              onPress={onMoveItemDown}
              variant="invisible"
              label={intl.formatMessage({ defaultMessage: "Move item down" })}
              tooltipPlacement="left"
              tooltipCloseDelay={0}
              className={cs.ListField.itemAction}
            >
              <PiCaretDown />
            </IconButton>
          ) : null}
          {!isFirstItem ? (
            <IconButton
              onPress={onMoveItemUp}
              variant="invisible"
              label={intl.formatMessage({ defaultMessage: "Move item up" })}
              tooltipPlacement="right"
              tooltipCloseDelay={0}
              className={cs.ListField.itemAction}
            >
              <PiCaretUp />
            </IconButton>
          ) : null}
        </div>
      )}
      <AnyField
        schema={schema}
        typeDefinition={typeDefinition.items}
        isNullable={false}
        isListItem={true}
        control={control}
        name={name}
        label={intl.formatMessage(
          { defaultMessage: "{itemName} number {itemNumber}" },
          {
            itemName:
              typeDefinition.items.dataType === null
                ? toTitleCase(typeDefinition.items.ref)
                : "Item",
            itemNumber: String(itemIndex + 1),
          },
        )}
      />
    </div>
  );
}
