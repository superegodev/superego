import type { Control, FieldValues } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import Button from "../../design-system/Button/Button.js";
import FieldLabel from "../../design-system/FieldLabel/FieldLabel.js";
import Fieldset from "../../design-system/Fieldset/Fieldset.js";
import { Fields } from "../../design-system/forms/forms.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import RHFAppPermissionsField from "../../widgets/RHFAppPermissionsField/RHFAppPermissionsField.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";

interface Props<T extends FieldValues = FieldValues> {
  control: Control<T>;
  formId: string;
  result: any;
  isOpen: boolean;
  onClose: () => void;
}
export default function SettingsModal<T extends FieldValues>({
  control,
  formId,
  result,
  isOpen,
  onClose,
}: Props<T>) {
  const intl = useIntl();
  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="Create app" />
      </ModalDialog.Heading>
      <Fields>
        <RHFTextField
          control={control as Control<FieldValues>}
          name="name"
          form={formId}
          label={intl.formatMessage({ defaultMessage: "Name" })}
          autoFocus={true}
          placeholder={intl.formatMessage({ defaultMessage: "My Awesome App" })}
        />
        <Fieldset isDisclosureDisabled={true}>
          <FieldLabel component="legend">
            <FormattedMessage defaultMessage="Permissions" />
          </FieldLabel>
          <Fieldset.Fields>
            <RHFAppPermissionsField
              control={control as Control<FieldValues>}
              name="permissions"
            />
          </Fieldset.Fields>
        </Fieldset>
      </Fields>
      <ModalDialog.Actions>
        <Button onPress={onClose}>
          <FormattedMessage defaultMessage="Cancel" />
        </Button>
        <RHFSubmitButton control={control} formId={formId} variant="primary">
          <FormattedMessage defaultMessage="Create" />
        </RHFSubmitButton>
      </ModalDialog.Actions>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </ModalDialog>
  );
}
