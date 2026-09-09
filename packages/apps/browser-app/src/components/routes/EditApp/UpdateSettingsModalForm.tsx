import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { App, AppPermissions } from "@superego/backend";
import type { ResultError } from "@superego/global-types";
import { valibotSchemas } from "@superego/shared-utils";
import { isEqual } from "es-toolkit";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import {
  useUpdateAppName,
  useUpdateAppPermissions,
} from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import Button from "../../design-system/Button/Button.js";
import FieldLabel from "../../design-system/FieldLabel/FieldLabel.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import { Form } from "../../design-system/forms/forms.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import FormStateEffects from "../../widgets/FormStateEffects/FormStateEffects.js";
import RHFAppPermissionsField from "../../widgets/RHFAppPermissionsField/RHFAppPermissionsField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";

interface FormValues {
  name: string;
  permissions: AppPermissions;
}
interface Props {
  app: App;
  formId: string;
  setSubmitDisabled: (isDisabled: boolean) => void;
  onClose: () => void;
}
export default function UpdateSettingsModalForm({
  app,
  formId,
  setSubmitDisabled,
  onClose,
}: Props) {
  const intl = useIntl();
  const { mutate: updateName } = useUpdateAppName();
  const { mutate: updatePermissions } = useUpdateAppPermissions();
  const [error, setError] = useState<ResultError<string, unknown> | null>(null);
  const {
    control,
    handleSubmit,
    resetField,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { name: app.name, permissions: app.permissions },
    mode: "all",
    resolver: standardSchemaResolver(
      v.strictObject({
        name: valibotSchemas.appName(),
        permissions: forms.schemas.appPermissions(intl),
      }),
    ),
  });
  const onSubmit = async ({ name, permissions }: FormValues) => {
    setError(null);
    if (name !== app.name) {
      const result = await updateName(app.id, name);
      if (!result.success) {
        setError(result.error);
        return;
      }
      resetField("name", { defaultValue: result.data.name });
    }
    if (!isEqual(permissions, app.permissions)) {
      const result = await updatePermissions(app.id, permissions);
      if (!result.success) {
        setError(result.error);
        return;
      }
    }
    onClose();
  };
  return (
    <ModalDialog
      isDismissable={!isSubmitting}
      isOpen={true}
      onOpenChange={onClose}
    >
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="App settings" />
      </ModalDialog.Heading>
      <Form id={formId} onSubmit={handleSubmit(onSubmit)}>
        <FormStateEffects
          control={control}
          setSubmitDisabled={setSubmitDisabled}
          triggerExitWarningWhenDirty={false}
          isDisabled={isSubmitting}
        />
        <RHFTextField
          control={control}
          name="name"
          autoFocus={true}
          label={intl.formatMessage({ defaultMessage: "Name" })}
          placeholder={intl.formatMessage({ defaultMessage: "My Awesome App" })}
        />
        <Fieldset isDisclosureDisabled={true}>
          <FieldLabel component="legend">
            <FormattedMessage defaultMessage="Permissions" />
          </FieldLabel>
          <Fieldset.Fields>
            <RHFAppPermissionsField control={control} name="permissions" />
          </Fieldset.Fields>
        </Fieldset>
        <ModalDialog.Actions>
          <Button onPress={onClose} isDisabled={isSubmitting}>
            <FormattedMessage defaultMessage="Cancel" />
          </Button>
          <RHFSubmitButton control={control} variant="primary">
            <FormattedMessage defaultMessage="Save" />
          </RHFSubmitButton>
        </ModalDialog.Actions>
        {error ? <ResultErrors errors={[error]} /> : null}
      </Form>
    </ModalDialog>
  );
}
