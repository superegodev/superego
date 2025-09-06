import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type {
  Collection,
  NonEmptyArray,
  SummaryPropertyDefinition,
  TypescriptModule,
} from "@superego/backend";
import { codegen, type Schema, valibotSchemas } from "@superego/schema";
import { mapNonEmptyArray } from "@superego/shared-utils";
import { dequal } from "dequal/lite";
import { useEffect, useMemo } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useCreateNewCollectionVersion } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import Alert from "../../design-system/Alert/Alert.js";
import ResultError from "../../design-system/ResultError/ResultError.js";
import RHFSchemaField from "../../widgets/RHFSchemaField/RHFSchemaField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFSummaryPropertyDefinitionsField from "../../widgets/RHFSummaryPropertyDefinitionsField/RHFSummaryPropertyDefinitionsField.js";
import RHFTypescriptModuleField from "../../widgets/RHFTypescriptModuleField/RHFTypescriptModuleField.js";
import * as cs from "./CollectionSettings.css.js";

const schemaTypescriptLibPath = "/CollectionSchema.ts";
const currentSchemaTypescriptLibPath = "/CurrentCollectionSchema.ts";
const nextSchemaTypescriptLibPath = "/NextCollectionSchema.ts";

interface FormValues {
  schema: Schema;
  migration: TypescriptModule;
  summaryProperties: NonEmptyArray<SummaryPropertyDefinition>;
}

interface Props {
  collection: Collection;
}
export default function CreateNewCollectionVersionForm({ collection }: Props) {
  const intl = useIntl();

  const { result, mutate } = useCreateNewCollectionVersion();

  const defaultMigration = useMemo(
    () =>
      forms.defaults.migration(
        collection.latestVersion.schema,
        currentSchemaTypescriptLibPath,
        collection.latestVersion.schema,
        nextSchemaTypescriptLibPath,
      ),
    [collection.latestVersion.schema],
  );
  const { control, handleSubmit, formState, resetField, watch, getValues } =
    useForm<FormValues>({
      defaultValues: {
        schema: collection.latestVersion.schema,
        migration: defaultMigration,
        summaryProperties: mapNonEmptyArray(
          collection.latestVersion.settings.summaryProperties,
          ({ name, getter }) => ({
            name,
            getter: {
              ...getter,
              compiled: forms.constants.FAILED_COMPILATION_OUTPUT,
            },
          }),
        ),
      },
      mode: "all",
      resolver: standardSchemaResolver(
        v.strictObject({
          schema: valibotSchemas.schema(),
          migration: forms.schemas.typescriptModule(intl),
          summaryProperties: forms.schemas.summaryPropertyDefinitions(intl),
        }),
      ),
    });

  const schema = watch("schema");
  const isSchemaDirty =
    formState.dirtyFields.schema &&
    !dequal(collection.latestVersion.schema, schema);

  // When schema changes, if the user didn't make any change to the migration
  // (hence it's still the default one), update it.
  useEffect(() => {
    if (typeof schema === "string") {
      return;
    }
    const { source } = getValues("migration");
    if (source === formState.defaultValues?.migration?.source) {
      resetField("migration", {
        defaultValue: forms.defaults.migration(
          collection.latestVersion.schema,
          currentSchemaTypescriptLibPath,
          schema,
          nextSchemaTypescriptLibPath,
        ),
      });
    }
  }, [
    collection.latestVersion.schema,
    schema,
    resetField,
    getValues,
    formState.defaultValues,
  ]);

  const onSubmit = async (values: FormValues) => {
    await mutate(
      collection.id,
      collection.latestVersion.id,
      values.schema,
      { summaryProperties: values.summaryProperties },
      values.migration,
    );
  };

  const summaryPropertiesSchemaTypescriptLib = useMemo(
    () =>
      typeof schema !== "string"
        ? ({ path: schemaTypescriptLibPath, source: codegen(schema) } as const)
        : null,
    [schema],
  );
  const migrationTypescriptLibs = useMemo(
    () =>
      typeof schema !== "string"
        ? [
            {
              path: currentSchemaTypescriptLibPath,
              source: codegen(collection.latestVersion.schema),
            } as const,
            {
              path: nextSchemaTypescriptLibPath,
              source: codegen(schema),
            } as const,
          ]
        : [],
    [collection.latestVersion.schema, schema],
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <RHFSchemaField
        control={control}
        name="schema"
        label={intl.formatMessage({ defaultMessage: "Schema" })}
        className={cs.CreateNewCollectionVersionForm.schemaTextField}
      />
      <RHFSummaryPropertyDefinitionsField
        control={control}
        name="summaryProperties"
        schemaTypescriptLib={summaryPropertiesSchemaTypescriptLib}
        getDefaultSummaryPropertyDefinition={(index) =>
          forms.defaults.summaryPropertyDefinition(
            index,
            schema,
            schemaTypescriptLibPath,
            intl,
          )
        }
        defaultExpanded={true}
      />
      <RHFTypescriptModuleField
        control={control}
        name="migration"
        isDisabled={!isSchemaDirty || typeof schema === "string"}
        label={intl.formatMessage({ defaultMessage: "Migration" })}
        description={intl.formatMessage({
          defaultMessage:
            "TypeScript function expression to migrate documents from the previous schema to the updated schema.",
        })}
        typescriptLibs={migrationTypescriptLibs}
      />
      <div className={cs.CreateNewCollectionVersionForm.submitButtonContainer}>
        <RHFSubmitButton
          control={control}
          variant="primary"
          isDisabled={!isSchemaDirty}
        >
          <FormattedMessage defaultMessage="Update and migrate" />
        </RHFSubmitButton>
      </div>
      {result?.error ? (
        <Alert
          variant="error"
          title={intl.formatMessage({
            defaultMessage: "Error updating schema and migrating documents",
          })}
        >
          <ResultError error={result.error} />
        </Alert>
      ) : null}
    </Form>
  );
}
