import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useUpdateCollectionSettings } from "../../../business-logic/backend/hooks.js";
import Alert from "../../design-system/Alert/Alert.js";
import RpcError from "../../design-system/RpcError/RpcError.js";
import RHFEmojiField from "../../widgets/RHFEmojiField/RHFEmojiField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./CollectionSettings.css.js";

interface FormValues {
  name: string;
  icon: string | null;
}

interface Props {
  collection: Collection;
}
export default function UpdateCollectionSettingsForm({ collection }: Props) {
  const intl = useIntl();

  const { result, mutate } = useUpdateCollectionSettings();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      name: collection.settings.name,
      icon: collection.settings.icon,
    },
    mode: "all",
    resolver: standardSchemaResolver(
      v.strictObject({
        name: valibotSchemas.collectionName(),
        icon: v.nullable(valibotSchemas.icon()),
      }),
    ),
  });

  const onSubmit = async (values: FormValues) => {
    const { success, data } = await mutate(collection.id, values);
    if (success) {
      const { name, icon } = data.settings;
      reset({ name, icon });
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className={cs.UpdateCollectionSettingsForm.nameIconInputs}>
        <RHFEmojiField
          control={control}
          name="icon"
          label={intl.formatMessage({ defaultMessage: "Icon" })}
        />
        <RHFTextField
          control={control}
          name="name"
          label={intl.formatMessage({ defaultMessage: "Name" })}
          autoFocus={true}
          className={cs.UpdateCollectionSettingsForm.nameInput}
        />
      </div>
      <div className={cs.UpdateCollectionSettingsForm.submitButtonContainer}>
        <RHFSubmitButton control={control} variant="primary">
          <FormattedMessage defaultMessage="Save settings" />
        </RHFSubmitButton>
      </div>
      {result?.error ? (
        <Alert
          variant="error"
          title={intl.formatMessage({
            defaultMessage: "Error saving settings",
          })}
        >
          <RpcError error={result.error} />
        </Alert>
      ) : null}
    </Form>
  );
}
