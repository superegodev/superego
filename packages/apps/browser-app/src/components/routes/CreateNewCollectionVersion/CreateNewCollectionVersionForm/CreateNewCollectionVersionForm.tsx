import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection } from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import { isEqual } from "es-toolkit";
import { useEffect, useMemo } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import { useCreateNewCollectionVersion } from "../../../../business-logic/backend/hooks.js";
import forms from "../../../../business-logic/forms/forms.js";
import FullPageTabs from "../../../design-system/FullPageTabs/FullPageTabs.js";
import ContentSummaryTab from "./ContentSummaryTab.js";
import type CreateNewCollectionVersionFormValues from "./CreateNewCollectionVersionFormValues.js";
import MigrationTab from "./MigrationTab.js";
import RemoteConvertersTab from "./RemoteConvertersTab.js";
import SchemaTab from "./SchemaTab.js";
import TabTitle from "./TabTitle.js";

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
        collection.latestVersion.schema,
      ),
    [collection.latestVersion.schema],
  );
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    resetField,
    reset,
    formState,
  } = useForm<CreateNewCollectionVersionFormValues>({
    defaultValues: {
      schema: collection.latestVersion.schema,
      migration: defaultMigration,
      contentSummaryGetter:
        collection.latestVersion.settings.contentSummaryGetter,
      remoteConverters: collection.latestVersion.remoteConverters,
    },
    mode: "all",
    resolver: standardSchemaResolver(
      v.strictObject({
        schema: valibotSchemas.schema(),
        migration: forms.schemas.typescriptModule(intl),
        contentSummaryGetter: forms.schemas.typescriptModule(intl),
        remoteConverters: v.nullable(forms.schemas.remoteConverters(intl)),
      }),
    ),
  });

  const onSubmit = async (values: CreateNewCollectionVersionFormValues) => {
    const { success, data } = await mutate(
      collection.id,
      collection.latestVersion.id,
      values.schema,
      { contentSummaryGetter: values.contentSummaryGetter },
      values.migration,
      values.remoteConverters,
    );
    if (success) {
      reset({
        schema: data.latestVersion.schema,
        migration: forms.defaults.migration(
          collection.latestVersion.schema,
          collection.latestVersion.schema,
        ),
        contentSummaryGetter: data.latestVersion.settings.contentSummaryGetter,
        remoteConverters: data.latestVersion.remoteConverters,
      });
    }
  };

  const schema = watch("schema");
  const isSchemaDirty =
    formState.dirtyFields.schema &&
    !isEqual(collection.latestVersion.schema, schema);
  const isSchemaValid = !(
    typeof schema === "string" || formState.errors.schema
  );

  // When schema changes, if it's valid:
  // - Require recompilation of contentSummaryGetter and remoteConverters. Don't
  //   update the sources, since they're what the user set in the previous
  //   collection version.
  // - Update migration, if still the default one, and in any case require
  //   recompilation.
  useEffect(() => {
    if (!isSchemaValid) {
      return;
    }

    setValue(
      "contentSummaryGetter.compiled",
      forms.constants.COMPILATION_REQUIRED,
    );
    if (getValues("remoteConverters") !== null) {
      setValue(
        "remoteConverters.fromRemoteDocument.compiled",
        forms.constants.COMPILATION_REQUIRED,
      );
    }

    const defaultMigrationSource = formState.defaultValues?.migration?.source;
    const currentMigrationSource = getValues("migration.source");
    if (currentMigrationSource === defaultMigrationSource) {
      resetField("migration", {
        defaultValue: forms.defaults.migration(
          collection.latestVersion.schema,
          schema,
        ),
      });
    } else {
      setValue("migration.compiled", forms.constants.COMPILATION_REQUIRED);
    }
  }, [
    collection.latestVersion.schema,
    schema,
    setValue,
    getValues,
    resetField,
    isSchemaValid,
    formState.defaultValues?.migration?.source,
  ]);

  const { connectors } = useGlobalData();
  const connectorName = collection.remote?.connector.name;
  const connector = connectors.find(({ name }) => name === connectorName);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FullPageTabs
        tabs={[
          {
            title: (
              <TabTitle hasErrors={!!formState.errors.schema}>
                <FormattedMessage defaultMessage="1. Schema" />
              </TabTitle>
            ),
            panel: <SchemaTab control={control} />,
          },
          {
            title: (
              <TabTitle hasErrors={!!formState.errors.contentSummaryGetter}>
                <FormattedMessage defaultMessage="2. Content summary" />
              </TabTitle>
            ),
            panel: <ContentSummaryTab control={control} schema={schema} />,
            isDisabled: !(isSchemaDirty && isSchemaValid),
          },
          collection.remote && connector
            ? {
                title: (
                  <TabTitle hasErrors={!!formState.errors.contentSummaryGetter}>
                    <FormattedMessage defaultMessage="3. Remote converters" />
                  </TabTitle>
                ),
                panel: (
                  <RemoteConvertersTab
                    control={control}
                    collection={collection}
                    schema={schema}
                    connector={connector}
                  />
                ),
                isDisabled: !(isSchemaDirty && isSchemaValid),
              }
            : null,
          {
            title: (
              <TabTitle hasErrors={!!formState.errors.migration}>
                {collection.remote ? (
                  <FormattedMessage defaultMessage="4. Migration" />
                ) : (
                  <FormattedMessage defaultMessage="3. Migration" />
                )}
              </TabTitle>
            ),
            panel: (
              <MigrationTab
                control={control}
                schema={schema}
                collection={collection}
                result={result}
              />
            ),
            isDisabled: !(isSchemaDirty && isSchemaValid),
          },
        ]}
      />
    </Form>
  );
}
