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
import {
  useDocumentLayoutOptions,
  useFieldUiOptions,
} from "./documentLayoutOptions.js";
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
  const fieldOptions = useFieldUiOptions(name);
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
      isDisclosureDisabled={fieldOptions?.allowCollapsing === false}
      data-data-type={typeDefinition.dataType}
      data-is-list-item={isListItem}
      data-testid="widgets.RHFContentField.StructField.root"
      className={cs.Field.root}
    >
      <AnyFieldLabel
        name={name}
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
  const fieldOptions = useFieldUiOptions(name);
  const columns = fieldOptions?.columns;

  if (!columns || columns.length === 0) {
    return Object.keys(typeDefinition.properties).map((propertyName) => (
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

  return <ColumnsLayout
    schema={schema}
    typeDefinition={typeDefinition}
    control={control}
    name={name}
    columns={columns}
  />;
}

function ColumnsLayout({
  schema,
  typeDefinition,
  control,
  name,
  columns,
}: Pick<Props, "schema" | "typeDefinition" | "control" | "name"> & {
  columns: import("@superego/backend").ColumnDefinition[];
}) {
  const layoutOptions = useDocumentLayoutOptions();
  const propertyNames = Object.keys(typeDefinition.properties);

  // Group properties by column index
  const columnGroups: string[][] = columns.map(() => []);
  for (const propertyName of propertyNames) {
    const childPath = name !== "" ? `${name}.${propertyName}` : propertyName;
    const childOptions =
      layoutOptions?.fieldUiOptions[`$${childPath}` as `$${string}`];
    const columnIndex = childOptions?.column ?? 0;
    const clampedIndex = Math.min(columnIndex, columns.length - 1);
    columnGroups[clampedIndex]!.push(propertyName);
  }

  return (
    <div className={cs.StructField.columnsContainer}>
      {columns.map((colDef, colIndex) => (
        <div
          key={`col-${String(colIndex)}`}
          className={
            colDef.overflow === "sticky"
              ? cs.StructField.stickyColumn
              : cs.StructField.scrollColumn
          }
          style={{ flex: `0 0 ${colDef.width}` }}
        >
          {columnGroups[colIndex]!.map((propertyName) => {
            const childPath =
              name !== "" ? `${name}.${propertyName}` : propertyName;
            return (
              <ColumnChild key={propertyName} fieldPath={childPath}>
                <AnyField
                  schema={schema}
                  typeDefinition={typeDefinition.properties[propertyName]!}
                  isNullable={
                    typeDefinition.nullableProperties?.includes(propertyName) ??
                    false
                  }
                  isListItem={false}
                  control={control}
                  name={childPath}
                  label={toTitleCase(propertyName)}
                />
              </ColumnChild>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ColumnChild({
  fieldPath,
  children,
}: {
  fieldPath: string;
  children: React.ReactNode;
}) {
  const childOptions = useFieldUiOptions(fieldPath);
  const flex = childOptions?.flex;
  if (flex !== undefined) {
    return <div style={{ flexGrow: flex, minHeight: 0 }}>{children}</div>;
  }
  return <>{children}</>;
}
