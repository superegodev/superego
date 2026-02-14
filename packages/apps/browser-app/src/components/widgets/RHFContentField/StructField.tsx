import {
  type Schema,
  type StructTypeDefinition,
  utils,
} from "@superego/schema";
import { type Control, useController } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import forms from "../../../business-logic/forms/forms.js";
import classnames from "../../../utils/classnames.js";
import toTitleCase from "../../../utils/toTitleCase.js";
import Button from "../../design-system/Button/Button.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import AnyField from "./AnyField.js";
import AnyFieldLabel from "./AnyFieldLabel.js";
import NullifyFieldAction from "./NullifyFieldAction.js";
import * as cs from "./RHFContentField.css.js";
import { useUiOptions } from "./uiOptions.js";

interface Props {
  schema: Schema;
  typeDefinition: StructTypeDefinition;
  isNullable: boolean;
  isListItem: boolean;
  control: Control;
  name: string;
  label: string;
}
export default function StructField({
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
  if (utils.getRootType(schema) === typeDefinition) {
    return (
      <Fields
        schema={schema}
        typeDefinition={typeDefinition}
        control={control}
        name={name}
      />
    );
  }
  const isValueNull = field.value === null;
  return (
    <Fieldset
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      data-testid="widgets.RHFContentField.StructField.root"
      className={cs.Field.root}
    >
      <AnyFieldLabel
        component="legend"
        typeDefinition={typeDefinition}
        isNullable={isNullable}
        label={label}
        actions={
          !isReadOnly ? (
            <NullifyFieldAction
              isNullable={isNullable}
              field={field}
              fieldLabel={label}
            />
          ) : undefined
        }
      />
      <Fieldset.Fields
        className={classnames(
          isValueNull && cs.StructAndListField.nullValueFields,
        )}
      >
        {isValueNull ? (
          isReadOnly ? (
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
          )
        ) : (
          <Fields
            schema={schema}
            typeDefinition={typeDefinition}
            control={control}
            name={name}
          />
        )}
      </Fieldset.Fields>
    </Fieldset>
  );
}

function Fields({
  schema,
  typeDefinition,
  control,
  name,
}: Pick<Props, "schema" | "typeDefinition" | "control" | "name">) {
  const sortedPropertyNames =
    typeDefinition.propertiesOrder ?? Object.keys(typeDefinition.properties);
  return sortedPropertyNames.map((propertyName) => (
    <AnyField
      key={propertyName}
      schema={schema}
      typeDefinition={typeDefinition.properties[propertyName]!}
      isNullable={
        typeDefinition.nullableProperties?.includes(propertyName) ?? false
      }
      isListItem={false}
      control={control}
      name={name !== "" ? `${name}.${propertyName}` : propertyName}
      label={toTitleCase(propertyName)}
    />
  ));
}
