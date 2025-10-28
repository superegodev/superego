import type { Control } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";
import RHFSubmitButton from "../../widgets/RHFSubmitButton/RHFSubmitButton.js";
import RHFTextField from "../../widgets/RHFTextField/RHFTextField.js";
import * as cs from "./CreateApp.css.js";

interface Props {
  control: Control<any>;
  formId: string;
  result: any;
  isOpen: boolean;
  onClose: () => void;
}
export default function SetNameAndSaveModal({
  control,
  formId,
  result,
  isOpen,
  onClose,
}: Props) {
  const intl = useIntl();
  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="Create app" />
      </ModalDialog.Heading>
      <RHFTextField
        control={control}
        name="name"
        form={formId}
        label={intl.formatMessage({ defaultMessage: "Name" })}
        autoFocus={true}
        placeholder={intl.formatMessage({ defaultMessage: "My Awesome App" })}
      />
      <div className={cs.SetNameAndSaveModal.submitButtonContainer}>
        <RHFSubmitButton control={control} formId={formId} variant="primary">
          <FormattedMessage defaultMessage="Create" />
        </RHFSubmitButton>
      </div>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </ModalDialog>
  );
}
