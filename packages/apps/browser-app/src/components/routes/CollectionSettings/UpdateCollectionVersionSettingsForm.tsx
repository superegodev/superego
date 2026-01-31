import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection, TypescriptModule } from "@superego/backend";
import { codegen } from "@superego/schema";
import { useMemo } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useUpdateLatestCollectionVersionSettings } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import useExitWarning from "../../../business-logic/navigation/useExitWarning.js";
import wellKnownLibPaths from "../../../business-logic/typescript/wellKnownLibPaths.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import Section from "../../design-system/Section/Section.js";
import RHFContentBlockingKeysGetterField from "../../widgets/RHFContentBlockingKeysGetterField/RHFContentBlockingKeysGetterField.js";
import RHFContentSummaryGetterField from "../../widgets/RHFContentSummaryGetterField/RHFContentSummaryGetterField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import * as cs from "./CollectionSettings.css.js";

interface FormValues {
  contentBlockingKeysGetter: TypescriptModule | null;
  contentSummaryGetter: TypescriptModule;
}

interface Props {
  collection: Collection;
}
export default function UpdateCollectionVersionSettingsForm({
  collection,
}: Props) {
  const intl = useIntl();

  const { result, mutate } = useUpdateLatestCollectionVersionSettings();

  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: {
      contentBlockingKeysGetter:
        collection.latestVersion.settings.contentBlockingKeysGetter,
      contentSummaryGetter:
        collection.latestVersion.settings.contentSummaryGetter,
    },
    mode: "onBlur",
    resolver: standardSchemaResolver(
      v.strictObject({
        contentBlockingKeysGetter: v.nullable(
          forms.schemas.typescriptModule(intl),
        ),
        contentSummaryGetter: forms.schemas.typescriptModule(intl),
      }),
    ),
  });

  const onSubmit = async (values: FormValues) => {
    const { success, data } = await mutate(
      collection.id,
      collection.latestVersion.id,
      values,
    );
    if (success) {
      const { contentBlockingKeysGetter, contentSummaryGetter } =
        data.latestVersion.settings;
      reset({ contentBlockingKeysGetter, contentSummaryGetter });
    }
  };
  useExitWarning(
    formState.isDirty
      ? intl.formatMessage({
          defaultMessage:
            "You have unsaved changes. Are you sure you want to leave?",
        })
      : null,
  );

  const schemaTypescriptLib = useMemo(
    () => ({
      path: wellKnownLibPaths.collectionSchema,
      source: codegen(collection.latestVersion.schema),
    }),
    [collection],
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Section
        title={intl.formatMessage({ defaultMessage: "Deduplication" })}
        level={3}
      >
        <RHFContentBlockingKeysGetterField
          control={control}
          name="contentBlockingKeysGetter"
          schema={collection.latestVersion.schema}
          schemaTypescriptLib={schemaTypescriptLib}
        />
      </Section>
      <Section
        title={intl.formatMessage({ defaultMessage: "Content summary" })}
        level={3}
      >
        <RHFContentSummaryGetterField
          control={control}
          name="contentSummaryGetter"
          schema={collection.latestVersion.schema}
          schemaTypescriptLib={schemaTypescriptLib}
        />
      </Section>
      <div
        className={cs.UpdateCollectionVersionSettingsForm.submitButtonContainer}
      >
        <RHFSubmitButton control={control} variant="primary">
          <FormattedMessage defaultMessage="Save collection version settings" />
        </RHFSubmitButton>
      </div>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </Form>
  );
}
