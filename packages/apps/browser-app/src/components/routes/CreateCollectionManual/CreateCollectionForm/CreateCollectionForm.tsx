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
    contentSummaryGetter,
  }: CreateCollectionFormValues) => {
    const { success, data } = await mutate(
      {
        name,
        icon,
        collectionCategoryId: null,
        defaultCollectionViewAppId: null,
        description,
        assistantInstructions,
      },
      schema,
      { contentSummaryGetter },
    );
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
  // - Update contentSummaryGetter, if still the default one, and in any case
  //   require recompilation.
  useEffect(() => {
    if (!isSchemaValid) {
      return;
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
              <TabTitle hasErrors={!!formState.errors.contentSummaryGetter}>
                <FormattedMessage defaultMessage="3. Content summary" />
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
