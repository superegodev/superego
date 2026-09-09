import type { Control, FieldValues, FieldPath } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import Button from "../../design-system/Button/Button.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import RHFAppPermissionsField from "../../widgets/RHFAppPermissionsField/RHFAppPermissionsField.js";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  isOpen: boolean;
  onClose: () => void;
}
export default function PermissionsModal<T extends FieldValues>({
  control,
  name,
  isOpen,
  onClose,
}: Props<T>) {
  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="Permissions" />
      </ModalDialog.Heading>
      <p>
        <FormattedMessage defaultMessage="These permissions apply when you create the app." />
      </p>
      <RHFAppPermissionsField control={control} name={name} />
      <ModalDialog.Actions>
        <Button onPress={onClose} variant="primary">
          <FormattedMessage defaultMessage="Done" />
        </Button>
      </ModalDialog.Actions>
    </ModalDialog>
  );
}
