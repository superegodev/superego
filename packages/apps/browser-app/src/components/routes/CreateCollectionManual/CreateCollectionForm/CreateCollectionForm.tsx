import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { valibotSchemas as schemaValibotSchemas } from "@superego/schema";
import { valibotSchemas as backendUtilsValibotSchemas } from "@superego/shared-utils";
import { useEffect, useMemo } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useCreateCollection } from "../../../../business-logic/backend/hooks.js";
import forms from "../../../../business-logic/forms/forms.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import useExitWarning from "../../../../business-logic/navigation/useExitWarning.js";
import useNavigationState from "../../../../business-logic/navigation/useNavigationState.js";
import FullPageTabs from "../../../design-system/FullPageTabs/FullPageTabs.js";
import ContentBlockingKeysTab from "./ContentBlockingKeysTab.js";
import ContentSummaryTab from "./ContentSummaryTab.js";
import type CreateCollectionFormValues from "./CreateCollectionFormValues.js";
import GeneralSettingsTab from "./GeneralSettingsTab.js";
import SchemaTab from "./SchemaTab.js";
import TabTitle from "./TabTitle.js";

const defaultSchema = forms.defaults.schema();

export default function CreateCollectionForm() {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { result, mutate } = useCreateCollection();

  const defaultContentBlockingKeysGetter = useMemo(
    () => forms.defaults.contentBlockingKeysGetter(defaultSchema),
    [],
  );
  const defaultContentSummaryGetter = useMemo(
    () => forms.defaults.contentSummaryGetter(defaultSchema),
    [],
  );
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    resetField,
    watch,
    formState,
  } = useForm<CreateCollectionFormValues>({
    defaultValues: {
      name: "",
      icon: null,
      description: null,
      assistantInstructions: null,
      schema: defaultSchema,
      contentBlockingKeysGetter: defaultContentBlockingKeysGetter,
      contentSummaryGetter: defaultContentSummaryGetter,
    },
    mode: "all",
    resolver: standardSchemaResolver(
      v.strictObject({
        name: backendUtilsValibotSchemas.collectionName(),
        icon: v.nullable(backendUtilsValibotSchemas.icon()),
        description: v.nullable(v.string()),
        assistantInstructions: v.nullable(v.string()),
        schema: schemaValibotSchemas.schema(),
        contentBlockingKeysGetter: v.nullable(
          forms.schemas.typescriptModule(intl),
        ),
        contentSummaryGetter: forms.schemas.typescriptModule(intl),
      }),
    ),
  });

  const onSubmit = async ({
    schema,
    name,
    icon,
    description,
    assistantInstructions,
    contentBlockingKeysGetter,
    contentSummaryGetter,
  }: CreateCollectionFormValues) => {
    const { success, data } = await mutate({
      settings: {
        name,
        icon,
        collectionCategoryId: null,
        defaultCollectionViewAppId: null,
        description,
        assistantInstructions,
      },
      schema,
      versionSettings: {
        contentBlockingKeysGetter,
        contentSummaryGetter,
        defaultDocumentViewUiOptions: null,
      },
    });
    if (success) {
      navigateTo(
        { name: RouteName.Collection, collectionId: data.id },
        { ignoreExitWarning: true },
      );
    }
  };

  const schema = watch("schema");
  const isSchemaValid = !(
    typeof schema === "string" || formState.errors.schema
  );

  // When schema changes, if it's valid:
  // - Update contentSummaryGetter and contentBlockingKeysGetter, if they are
  //   still the default ones, and in any case require recompilation.
  useEffect(() => {
    if (!isSchemaValid) {
      return;
    }

    const defaultContentBlockingKeysGetterSource =
      formState.defaultValues?.contentBlockingKeysGetter?.source;
    const currentContentBlockingKeysGetterSource = getValues(
      "contentBlockingKeysGetter.source",
    );
    if (
      currentContentBlockingKeysGetterSource ===
      defaultContentBlockingKeysGetterSource
    ) {
      resetField("contentBlockingKeysGetter", {
        defaultValue: forms.defaults.contentBlockingKeysGetter(schema),
      });
    } else {
      setValue(
        "contentBlockingKeysGetter.compiled",
        forms.constants.COMPILATION_REQUIRED,
      );
    }

    const defaultContentSummaryGetterSource =
      formState.defaultValues?.contentSummaryGetter?.source;
    const currentContentSummaryGetterSource = getValues(
      "contentSummaryGetter.source",
    );
    if (
      currentContentSummaryGetterSource === defaultContentSummaryGetterSource
    ) {
      resetField("contentSummaryGetter", {
        defaultValue: forms.defaults.contentSummaryGetter(schema),
      });
    } else {
      setValue(
        "contentSummaryGetter.compiled",
        forms.constants.COMPILATION_REQUIRED,
      );
    }
  }, [
    schema,
    setValue,
    getValues,
    resetField,
    isSchemaValid,
    formState.defaultValues?.contentBlockingKeysGetter?.source,
    formState.defaultValues?.contentSummaryGetter?.source,
  ]);

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
              <TabTitle
                hasErrors={
                  !!(
                    formState.errors.icon ||
                    formState.errors.name ||
                    formState.errors.description ||
                    formState.errors.assistantInstructions
                  )
                }
              >
                <FormattedMessage defaultMessage="1. General settings" />
              </TabTitle>
            ),
            panel: <GeneralSettingsTab control={control} />,
          },
          {
            title: (
              <TabTitle hasErrors={!!formState.errors.schema}>
                <FormattedMessage defaultMessage="2. Schema" />
              </TabTitle>
            ),
            panel: <SchemaTab control={control} />,
          },
          {
            title: (
              <TabTitle
                hasErrors={!!formState.errors.contentBlockingKeysGetter}
              >
                <FormattedMessage defaultMessage="3. Deduplication" />
              </TabTitle>
            ),
            panel: <ContentBlockingKeysTab control={control} schema={schema} />,
            isDisabled: !isSchemaValid,
          },
          {
            title: (
              <TabTitle hasErrors={!!formState.errors.contentSummaryGetter}>
                <FormattedMessage defaultMessage="4. Content summary" />
              </TabTitle>
            ),
            panel: (
              <ContentSummaryTab
                control={control}
                schema={schema}
                result={result}
              />
            ),
            isDisabled: !isSchemaValid,
          },
        ]}
      />
    </Form>
  );
}
