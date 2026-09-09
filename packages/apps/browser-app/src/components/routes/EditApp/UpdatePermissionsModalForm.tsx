import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { App, AppPermissions } from "@superego/backend";
import { Form } from "react-aria-components";
import { useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import * as v from "valibot";
import { useUpdateAppPermissions } from "../../../business-logic/backend/hooks.js";
import forms from "../../../business-logic/forms/forms.js";
import Button from "../../design-system/Button/Button.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import FormStateEffects from "../../widgets/FormStateEffects/FormStateEffects.js";
import RHFAppPermissionsField from "../../widgets/RHFAppPermissionsField/RHFAppPermissionsField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";

interface FormValues {
  permissions: AppPermissions;
}
interface Props {
  app: App;
  formId: string;
  setSubmitDisabled: (isDisabled: boolean) => void;
  onClose: () => void;
}
export default function UpdatePermissionsModalForm({
  app,
  formId,
  setSubmitDisabled,
  onClose,
}: Props) {
  const intl = useIntl();
  const { result, mutate } = useUpdateAppPermissions();
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { permissions: app.permissions },
    mode: "all",
    resolver: standardSchemaResolver(
      v.strictObject({ permissions: forms.schemas.appPermissions(intl) }),
    ),
  });
  const onSubmit = async ({ permissions }: FormValues) => {
    const { success } = await mutate(app.id, permissions);
    if (success) {
      onClose();
    }
  };
  return (
    <ModalDialog isDismissable={true} isOpen={true} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="Permissions" />
      </ModalDialog.Heading>
      <Form id={formId} onSubmit={handleSubmit(onSubmit)}>
        <FormStateEffects
          control={control}
          setSubmitDisabled={setSubmitDisabled}
          triggerExitWarningWhenDirty={false}
        />
        <RHFAppPermissionsField control={control} name="permissions" />
        <ModalDialog.Actions>
          <Button onPress={onClose}>
            <FormattedMessage defaultMessage="Cancel" />
          </Button>
          <RHFSubmitButton control={control} variant="primary">
            <FormattedMessage defaultMessage="Save" />
          </RHFSubmitButton>
        </ModalDialog.Actions>
        {result?.error ? <ResultErrors errors={[result.error]} /> : null}
      </Form>
    </ModalDialog>
  );
}
