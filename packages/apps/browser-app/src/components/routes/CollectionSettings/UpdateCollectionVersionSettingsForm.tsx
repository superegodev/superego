import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type {
  Collection,
  NonEmptyArray,
  SummaryPropertyDefinition,
} from "@superego/backend";
import { codegen } from "@superego/schema";
import { useMemo } from "react";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useUpdateLatestCollectionVersionSettings } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import Alert from "../../design-system/Alert/Alert.js";
import RpcError from "../../design-system/RpcError/RpcError.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFSummaryPropertyDefinitionsField from "../../widgets/RHFSummaryPropertyDefinitionsField/RHFSummaryPropertyDefinitionsField.js";
import * as cs from "./CollectionSettings.css.js";

const schemaTypescriptLibPath = "/CollectionSchema.ts";

interface FormValues {
  summaryProperties: NonEmptyArray<SummaryPropertyDefinition>;
}

interface Props {
  collection: Collection;
}
export default function UpdateCollectionVersionSettingsForm({
  collection,
}: Props) {
  const intl = useIntl();

  const { result, mutate } = useUpdateLatestCollectionVersionSettings();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      summaryProperties: collection.latestVersion.settings.summaryProperties,
    },
    mode: "all",
    resolver: standardSchemaResolver(
      v.strictObject({
        summaryProperties: forms.schemas.summaryPropertyDefinitions(intl),
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
      const { summaryProperties } = data.latestVersion.settings;
      reset({ summaryProperties });
    }
  };
  const schemaTypescriptLib = useMemo(
    () =>
      ({
        path: schemaTypescriptLibPath,
        source: codegen(collection.latestVersion.schema),
      }) as const,
    [collection],
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <RHFSummaryPropertyDefinitionsField
        control={control}
        name="summaryProperties"
        schemaTypescriptLib={schemaTypescriptLib}
        getDefaultSummaryPropertyDefinition={(index) =>
          forms.defaults.summaryPropertyDefinition(
            index,
            collection.latestVersion.schema,
            schemaTypescriptLibPath,
            intl,
          )
        }
      />
      <div className={cs.UpdateCollectionSettingsForm.submitButtonContainer}>
        <RHFSubmitButton control={control} variant="primary">
          <FormattedMessage defaultMessage="Save collection version settings" />
        </RHFSubmitButton>
      </div>
      {result?.error ? (
        <Alert
          variant="error"
          title={intl.formatMessage({
            defaultMessage: "Error saving collection version settings",
          })}
        >
          <RpcError error={result.error} />
        </Alert>
      ) : null}
    </Form>
  );
}
