import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection } from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import { valibotSchemas as sharedUtilsValibotSchemas } from "@superego/shared-utils";
import { isEqual } from "es-toolkit";
import { useEffect, useMemo, useRef } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import { useCreateNewCollectionVersion } from "../../../../business-logic/backend/hooks.js";
import forms from "../../../../business-logic/forms/forms.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import useExitWarning from "../../../../business-logic/navigation/useExitWarning.js";
import useNavigationState from "../../../../business-logic/navigation/useNavigationState.js";
import ToastType from "../../../../business-logic/toasts/ToastType.js";
import toasts from "../../../../business-logic/toasts/toasts.js";
import CollectionUtils from "../../../../utils/CollectionUtils.js";
import FullPageTabs from "../../../design-system/FullPageTabs/FullPageTabs.js";
import ContentBlockingKeysTab from "./ContentBlockingKeysTab.js";
import ContentSummaryTab from "./ContentSummaryTab.js";
import type CreateNewCollectionVersionFormValues from "./CreateNewCollectionVersionFormValues.js";
import DefaultDocumentViewUiOptionsTab from "./DefaultDocumentViewUiOptionsTab.js";
import MigrationTab from "./MigrationTab.js";
import RemoteConvertersTab from "./RemoteConvertersTab.js";
import SchemaTab from "./SchemaTab.js";
import TabTitle from "./TabTitle.js";

interface Props {
  collection: Collection;
}
export default function CreateNewCollectionVersionForm({ collection }: Props) {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { result, mutate } = useCreateNewCollectionVersion();

  const defaultMigration = useMemo(
    () =>
      forms.defaults.migration(
        collection.latestVersion.schema,
        collection.latestVersion.schema,
      ),
    [collection.latestVersion.schema],
  );
  const { control, handleSubmit, watch, setValue, getValues, formState } =
    useForm<CreateNewCollectionVersionFormValues>({
      defaultValues: {
        schema: collection.latestVersion.schema,
        contentBlockingKeysGetter:
          collection.latestVersion.settings.contentBlockingKeysGetter,
        contentSummaryGetter:
          collection.latestVersion.settings.contentSummaryGetter,
        defaultDocumentViewUiOptions:
          collection.latestVersion.settings.defaultDocumentViewUiOptions,
        migration: CollectionUtils.hasRemote(collection)
          ? null
          : defaultMigration,
        remoteConverters: collection.latestVersion.remoteConverters,
      },
      mode: "all",
      resolver: (values, context, options) => {
        const schemaParseResult = v.safeParse(
          valibotSchemas.schema(),
          values.schema,
        );
        const currentSchema = schemaParseResult.success
          ? schemaParseResult.output
          : collection.latestVersion.schema;
        return standardSchemaResolver(
          v.strictObject({
            schema: valibotSchemas.schema(),
            contentBlockingKeysGetter: v.nullable(
              forms.schemas.typescriptModule(intl),
            ),
            contentSummaryGetter: forms.schemas.typescriptModule(intl),
            defaultDocumentViewUiOptions: v.nullable(
              sharedUtilsValibotSchemas.defaultDocumentViewUiOptions(
                currentSchema,
              ),
            ),
            migration: v.nullable(forms.schemas.typescriptModule(intl)),
            remoteConverters: v.nullable(forms.schemas.remoteConverters(intl)),
          }),
        )(values, context, options);
      },
    });

  const onSubmit = async (values: CreateNewCollectionVersionFormValues) => {
    const { success } = await mutate(
      collection.id,
      collection.latestVersion.id,
      values.schema,
      {
        contentBlockingKeysGetter: values.contentBlockingKeysGetter,
        contentSummaryGetter: values.contentSummaryGetter,
        defaultDocumentViewUiOptions: values.defaultDocumentViewUiOptions,
      },
      values.migration,
      values.remoteConverters,
    );
    if (success) {
      toasts.add({
        type: ToastType.Success,
        title: intl.formatMessage({
          defaultMessage: "New collection version created",
        }),
      });
      navigateTo(
        { name: RouteName.Collection, collectionId: collection.id },
        { ignoreExitWarning: true },
      );
    }
  };

  // Track the last-applied default source for the migration field. We use a ref
  // instead of formState.defaultValues because resetField silently does nothing
  // when the target field's controller is not mounted — which is the case here
  // because react-aria-components' TabPanel only renders the active tab's
  // content. setValue, on the other hand, always updates _formValues regardless
  // of whether the field is registered, so we pair it with a ref to track
  // whether the user has customized the source.
  const lastDefaultMigrationSourceRef = useRef(defaultMigration?.source);

  const schema = watch("schema");
  const isSchemaDirty =
    formState.dirtyFields.schema &&
    !isEqual(collection.latestVersion.schema, schema);
  const isSchemaValid = !(
    typeof schema === "string" || formState.errors.schema
  );

  // When schema changes, if it's valid:
  // - Require recompilation of contentSummaryGetter, contentBlockingKeysGetter,
  //   and remoteConverters (for collections with a remote). Don't update the
  //   sources, since they're what the user set in the previous collection version.
  // - For collections with a remote: update migration, if still the default
  //   one, and in any case require recompilation.
  useEffect(() => {
    if (!isSchemaValid) {
      return;
    }

    setValue(
      "contentSummaryGetter.compiled",
      forms.constants.COMPILATION_REQUIRED,
    );
    if (getValues("contentBlockingKeysGetter") !== null) {
      setValue(
        "contentBlockingKeysGetter.compiled",
        forms.constants.COMPILATION_REQUIRED,
      );
    }
    if (getValues("remoteConverters") !== null) {
      setValue(
        "remoteConverters.fromRemoteDocument.compiled",
        forms.constants.COMPILATION_REQUIRED,
      );
    }

    if (getValues("migration") !== null) {
      const currentMigrationSource = getValues("migration.source");
      if (currentMigrationSource === lastDefaultMigrationSourceRef.current) {
        const newDefault = forms.defaults.migration(
          collection.latestVersion.schema,
          schema,
        );
        setValue("migration", newDefault);
        lastDefaultMigrationSourceRef.current = newDefault.source;
      } else {
        setValue("migration.compiled", forms.constants.COMPILATION_REQUIRED);
      }
    }
  }, [
    collection.latestVersion.schema,
    schema,
    setValue,
    getValues,
    isSchemaValid,
  ]);

  const { connectors } = useGlobalData();
  const connectorName = collection.remote?.connector.name;
  const connector = connectors.find(({ name }) => name === connectorName);

  useExitWarning(
    formState.isDirty
      ? intl.formatMessage({
          defaultMessage:
            "You have unsaved changes. Are you sure you want to leave?",
        })
      : null,
  );

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
            panel: <SchemaTab control={control} collection={collection} />,
          },
          {
            title: (
              <TabTitle
                hasErrors={!!formState.errors.contentBlockingKeysGetter}
              >
                <FormattedMessage defaultMessage="2. Deduplication" />
              </TabTitle>
            ),
            panel: <ContentBlockingKeysTab control={control} schema={schema} />,
            isDisabled: !(isSchemaDirty && isSchemaValid),
          },
          {
            title: (
              <TabTitle hasErrors={!!formState.errors.contentSummaryGetter}>
                <FormattedMessage defaultMessage="3. Content summary" />
              </TabTitle>
            ),
            panel: <ContentSummaryTab control={control} schema={schema} />,
            isDisabled: !(isSchemaDirty && isSchemaValid),
          },
          {
            title: (
              <TabTitle
                hasErrors={!!formState.errors.defaultDocumentViewUiOptions}
              >
                <FormattedMessage defaultMessage="4. UI options" />
              </TabTitle>
            ),
            panel: (
              <DefaultDocumentViewUiOptionsTab
                control={control}
                schema={schema}
              />
            ),
            isDisabled: !(isSchemaDirty && isSchemaValid),
          },
          CollectionUtils.hasRemote(collection) && connector
            ? {
                title: (
                  <TabTitle hasErrors={!!formState.errors.remoteConverters}>
                    <FormattedMessage defaultMessage="5. Remote converters" />
                  </TabTitle>
                ),
                panel: (
                  <RemoteConvertersTab
                    control={control}
                    collection={collection}
                    schema={schema}
                    connector={connector}
                    result={result}
                  />
                ),
                isDisabled: !(isSchemaDirty && isSchemaValid),
              }
            : null,
          !CollectionUtils.hasRemote(collection)
            ? {
                title: (
                  <TabTitle hasErrors={!!formState.errors.migration}>
                    <FormattedMessage defaultMessage="5. Migration" />
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
              }
            : null,
        ]}
      />
    </Form>
  );
}
