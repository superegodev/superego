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
import { Fields as FormsFields } from "../../design-system/forms/forms.js";
import AnyField from "./AnyField.js";
import AnyFieldLabel from "./AnyFieldLabel.js";
import LayoutRenderer from "./LayoutRenderer.js";
import NullifyFieldAction from "./NullifyFieldAction.js";
import * as cs from "./RHFContentField.css.js";
import { useUiOptions } from "./uiOptions.js";
import useFieldUiOptions from "./useFieldUiOptions.js";

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
  const { layout, allowCollapsing } = useFieldUiOptions(name);
  if (utils.getRootType(schema) === typeDefinition) {
    return (
      <Fields
        schema={schema}
        typeDefinition={typeDefinition}
        control={control}
        name={name}
        layout={layout}
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
      isDisclosureDisabled={!isListItem && allowCollapsing === false}
    >
      <AnyFieldLabel
        name={field.name}
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
        component="legend"
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
            layout={layout}
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
  layout,
}: Pick<Props, "schema" | "typeDefinition" | "control" | "name"> & {
  layout: ReturnType<typeof useFieldUiOptions>["layout"];
}) {
  if (layout) {
    return (
      <LayoutRenderer
        layout={layout}
        schema={schema}
        typeDefinition={typeDefinition}
        control={control}
        name={name}
      />
    );
  }
  return (
    <FormsFields>
      {Object.keys(typeDefinition.properties).map((propertyName) => (
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
      ))}
    </FormsFields>
  );
}
