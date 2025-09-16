import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { valibotSchemas as schemaValibotSchemas } from "@superego/schema";
import { valibotSchemas as backendUtilsValibotSchemas } from "@superego/shared-utils";
import { useMemo } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useCreateCollection } from "../../../../business-logic/backend/hooks.js";
import forms from "../../../../business-logic/forms/forms.js";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../../business-logic/navigation/useNavigationState.js";
import Alert from "../../../design-system/Alert/Alert.js";
import FullPageTabs from "../../../design-system/FullPageTabs/FullPageTabs.js";
import ResultError from "../../../design-system/ResultError/ResultError.js";
import RHFSubmitButton from "../../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import * as cs from "../CreateCollection.css.js";
import ContentSummaryTab from "./ContentSummaryTab.js";
import type CreateCollectionFormValues from "./CreateCollectionFormValues.js";
import GeneralSettingsTab from "./GeneralSettingsTab.js";
import SchemaTab from "./SchemaTab.js";
import schemaTypescriptLibPath from "./schemaTypescriptLibPath.js";
import TabTitle from "./TabTitle.js";

const defaultSchema = forms.defaults.schema();

export default function CreateCollectionForm() {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();

  const { result, mutate } = useCreateCollection();

  const defaultContentSummaryGetter = useMemo(
    () =>
      forms.defaults.contentSummaryGetter(
        defaultSchema,
        schemaTypescriptLibPath,
      ),
    [],
  );
  const { control, handleSubmit, setValue, watch, formState } =
    useForm<CreateCollectionFormValues>({
      defaultValues: {
        name: "",
        icon: null,
        description: null,
        assistantInstructions: null,
        schema: defaultSchema,
        contentSummaryGetter: defaultContentSummaryGetter,
      },
      mode: "onSubmit",
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
        description,
        assistantInstructions,
      },
      schema,
      { contentSummaryGetter },
    );
    if (success) {
      navigateTo({ name: RouteName.Collection, collectionId: data.id });
    }
  };

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
                watch={watch}
                setValue={setValue}
                defaultContentSummaryGetter={defaultContentSummaryGetter}
              />
            ),
          },
        ]}
      />
      <div className={cs.CreateCollectionForm.submitButtonContainer}>
        <RHFSubmitButton
          control={control}
          variant="primary"
          disableOnNotDirty={false}
        >
          <FormattedMessage defaultMessage="Create" />
        </RHFSubmitButton>
      </div>
      {result?.error ? (
        <Alert
          variant="error"
          title={intl.formatMessage({
            defaultMessage: "Error creating collection",
          })}
        >
          <ResultError error={result.error} />
        </Alert>
      ) : null}
    </Form>
  );
}
