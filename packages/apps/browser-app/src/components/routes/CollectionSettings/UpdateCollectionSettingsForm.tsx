import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Collection } from "@superego/backend";
import { valibotSchemas } from "@superego/shared-utils";
import { type Control, useController, useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useUpdateCollectionSettings } from "../../../business-logic/backend/hooks.js";
import { Description, Form, Switch } from "../../design-system/forms/forms.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import FormStateEffects from "../../widgets/FormStateEffects/FormStateEffects.js";
import RHFEmojiField from "../../widgets/RHFEmojiField/RHFEmojiField.js";
import RHFMarkdownField from "../../widgets/RHFMarkdownField/RHFMarkdownField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./CollectionSettings.css.js";

interface FormValues {
  name: string;
  icon: string | null;
  description: string | null;
  assistantInstructions: string | null;
  redirectToCollectionAfterDocumentCreation: boolean;
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
      redirectToCollectionAfterDocumentCreation:
        collection.settings.redirectToCollectionAfterDocumentCreation,
    },
    mode: "onBlur",
    resolver: standardSchemaResolver(
      v.strictObject({
        name: valibotSchemas.collectionName(),
        icon: v.nullable(valibotSchemas.icon()),
        description: v.nullable(v.string()),
        assistantInstructions: v.nullable(v.string()),
        redirectToCollectionAfterDocumentCreation: v.boolean(),
      }),
    ),
  });

  const onSubmit = async (values: FormValues) => {
    const { success, data } = await mutate(collection.id, values);
    if (success) {
      const {
        name,
        icon,
        description,
        assistantInstructions,
        redirectToCollectionAfterDocumentCreation,
      } = data.settings;
      reset({
        name,
        icon,
        description,
        assistantInstructions,
        redirectToCollectionAfterDocumentCreation,
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormStateEffects control={control} triggerExitWarningWhenDirty={true} />
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
      <RHFMarkdownField
        control={control}
        name="description"
        label={intl.formatMessage({ defaultMessage: "Description" })}
        showToolbar={false}
        emptyInputValue={null}
        placeholder="null"
      />
      <RHFMarkdownField
        control={control}
        name="assistantInstructions"
        label={intl.formatMessage({ defaultMessage: "Assistant instructions" })}
        showToolbar={false}
        emptyInputValue={null}
        placeholder="null"
        description={intl.formatMessage({
          defaultMessage:
            "Specific instructions for this collection to pass to the assistant.",
        })}
      />
      <RedirectToCollectionAfterDocumentCreationSwitch control={control} />
      <div className={cs.UpdateCollectionSettingsForm.submitButtonContainer}>
        <RHFSubmitButton control={control} variant="primary">
          <FormattedMessage defaultMessage="Save settings" />
        </RHFSubmitButton>
      </div>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </Form>
  );
}

function RedirectToCollectionAfterDocumentCreationSwitch({
  control,
}: {
  control: Control<FormValues>;
}) {
  const { field } = useController({
    control,
    name: "redirectToCollectionAfterDocumentCreation",
  });
  return (
    <div>
      <Switch isSelected={field.value} onChange={field.onChange}>
        <FormattedMessage defaultMessage="Redirect to collection after document creation" />
      </Switch>
      <Description>
        <FormattedMessage defaultMessage="When enabled, creating a document will navigate back to the collection page instead of to the new document." />
      </Description>
    </div>
  );
}
