import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useUpdateCollectionSettings } from "../../../business-logic/backend/hooks.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import RHFEmojiField from "../../widgets/RHFEmojiField/RHFEmojiField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./CollectionSettings.css.js";

interface FormValues {
  name: string;
  icon: string | null;
  description: string | null;
  assistantInstructions: string | null;
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
      description: collection.settings.description,
      assistantInstructions: collection.settings.assistantInstructions,
    },
    mode: "onBlur",
    resolver: standardSchemaResolver(
      v.strictObject({
        name: valibotSchemas.collectionName(),
        icon: v.nullable(valibotSchemas.icon()),
        description: v.nullable(v.string()),
        assistantInstructions: v.nullable(v.string()),
      }),
    ),
  });

  const onSubmit = async (values: FormValues) => {
    const { success, data } = await mutate(collection.id, values);
    if (success) {
      const { name, icon, description, assistantInstructions } = data.settings;
      reset({ name, icon, description, assistantInstructions });
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
      <RHFTextField
        control={control}
        name="description"
        label={intl.formatMessage({ defaultMessage: "Description" })}
        textArea={true}
        emptyInputValue={null}
      />
      <RHFTextField
        control={control}
        name="assistantInstructions"
        label={intl.formatMessage({ defaultMessage: "Assistant instructions" })}
        textArea={true}
        emptyInputValue={null}
        description={intl.formatMessage({
          defaultMessage:
            "Specific instructions for this collection to pass to the assistant.",
        })}
      />
      <div className={cs.UpdateCollectionSettingsForm.submitButtonContainer}>
        <RHFSubmitButton control={control} variant="primary">
          <FormattedMessage defaultMessage="Save settings" />
        </RHFSubmitButton>
      </div>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </Form>
  );
}
