import type { ListTypeDefinition, Schema } from "@superego/schema";
import {
  type Control,
  useController,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { PiBackspace, PiCaretDown, PiCaretUp, PiPlus } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import formatIdentifier from "../../../utils/formatIdentifier.js";
import { generateAnyDefaultValues } from "../../../utils/generateDefaultValues.js";
import Button from "../../design-system/Button/Button.js";
import FieldLabel from "../../design-system/FieldLabel/FieldLabel.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import AnyField from "./AnyField.js";
import AnyFieldLabel from "./AnyFieldLabel.js";
import NullifyFieldAction from "./NullifyFieldAction.js";
import * as cs from "./RHFContentField.css.js";

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
  const { field } = useController({ control, name });
  return (
    <Fieldset
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      className={cs.Field.root}
    >
      <AnyFieldLabel
        component="legend"
        typeDefinition={typeDefinition}
        isNullable={isNullable}
        label={label}
      />
      <Fieldset.Fields className={cs.StructAndListField.nullValueFields}>
        <Button
          onPress={() =>
            field.onChange(generateAnyDefaultValues(typeDefinition, schema))
          }
          className={cs.StructAndListField.nullValueSetValueButton}
        >
          <FormattedMessage defaultMessage="null - click to set a value" />
        </Button>
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
  const intl = useIntl();
  const { field } = useController({ control, name });
  const { fields, append, remove, move } = useFieldArray({ control, name });
  return (
    <Fieldset
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      className={cs.Field.root}
    >
      <AnyFieldLabel
        component="legend"
        typeDefinition={typeDefinition}
        isNullable={isNullable}
        label={label}
        actions={
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
                  value: generateAnyDefaultValues(typeDefinition.items, schema),
                })
              }
            >
              <PiPlus />
            </FieldLabel.Action>
          </>
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
  onRemoveItem,
  onMoveItemUp,
  onMoveItemDown,
}: ItemFieldProps) {
  const intl = useIntl();
  return (
    <div className={cs.ListField.item}>
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
                ? formatIdentifier(typeDefinition.items.ref)
                : "Item",
            itemNumber: String(itemIndex + 1),
          },
        )}
      />
    </div>
  );
}
