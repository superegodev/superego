import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type {
  Collection,
  DefaultDocumentViewUiOptions,
  TypescriptModule,
} from "@superego/backend";
import { codegen } from "@superego/schema";
import { valibotSchemas as sharedUtilsValibotSchemas } from "@superego/shared-utils";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useUpdateLatestCollectionVersionSettings } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import useExitWarning from "../../../business-logic/navigation/useExitWarning.js";
import wellKnownLibPaths from "../../../business-logic/typescript/wellKnownLibPaths.js";
import { Form } from "../../design-system/forms/forms.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import Section from "../../design-system/Section/Section.js";
import RHFContentBlockingKeysGetterField from "../../widgets/RHFContentBlockingKeysGetterField/RHFContentBlockingKeysGetterField.js";
import RHFContentSummaryGetterField from "../../widgets/RHFContentSummaryGetterField/RHFContentSummaryGetterField.js";
import RHFDefaultDocumentViewUiOptionsField from "../../widgets/RHFDefaultDocumentViewUiOptionsField/RHFDefaultDocumentViewUiOptionsField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import * as cs from "./CollectionSettings.css.js";

interface FormValues {
  contentBlockingKeysGetter: TypescriptModule | null;
  contentSummaryGetter: TypescriptModule;
  defaultDocumentViewUiOptions: DefaultDocumentViewUiOptions | null;
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
      defaultDocumentViewUiOptions:
        collection.latestVersion.settings.defaultDocumentViewUiOptions,
    },
    mode: "onBlur",
    resolver: standardSchemaResolver(
      v.strictObject({
        contentBlockingKeysGetter: v.nullable(
          forms.schemas.typescriptModule(intl),
        ),
        contentSummaryGetter: forms.schemas.typescriptModule(intl),
        defaultDocumentViewUiOptions: v.nullable(
          sharedUtilsValibotSchemas.defaultDocumentViewUiOptions(
            collection.latestVersion.schema,
          ),
        ),
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
      const {
        contentBlockingKeysGetter,
        contentSummaryGetter,
        defaultDocumentViewUiOptions,
      } = data.latestVersion.settings;
      reset({
        contentBlockingKeysGetter,
        contentSummaryGetter,
        defaultDocumentViewUiOptions,
      });
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
      <Section
        title={intl.formatMessage({
          defaultMessage: "Document view UI options",
        })}
        level={3}
      >
        <RHFDefaultDocumentViewUiOptionsField
          control={control}
          name="defaultDocumentViewUiOptions"
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
