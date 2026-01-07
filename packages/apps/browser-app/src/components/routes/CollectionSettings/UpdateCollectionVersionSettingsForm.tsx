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
import RHFContentSummaryGetterField from "../../widgets/RHFContentSummaryGetterField/RHFContentSummaryGetterField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import * as cs from "./CollectionSettings.css.js";

interface FormValues {
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
      contentSummaryGetter:
        collection.latestVersion.settings.contentSummaryGetter,
    },
    mode: "onBlur",
    resolver: standardSchemaResolver(
      v.strictObject({
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
      const { contentSummaryGetter } = data.latestVersion.settings;
      reset({ contentSummaryGetter });
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
      <RHFContentSummaryGetterField
        control={control}
        name="contentSummaryGetter"
        schema={collection.latestVersion.schema}
        schemaTypescriptLib={schemaTypescriptLib}
      />
      <div className={cs.UpdateCollectionSettingsForm.submitButtonContainer}>
        <RHFSubmitButton control={control} variant="primary">
          <FormattedMessage defaultMessage="Save collection version settings" />
        </RHFSubmitButton>
      </div>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </Form>
  );
}
