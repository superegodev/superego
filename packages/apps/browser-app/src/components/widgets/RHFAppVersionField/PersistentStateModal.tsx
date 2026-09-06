import type { Control, FieldValues, FieldPath } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import Button from "../../design-system/Button/Button.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import StateDefinitionFields from "./StateDefinitionFields.js";

interface Props<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  isOpen: boolean;
  onClose: () => void;
}
export default function PersistentStateModal<T extends FieldValues>({
  control,
  name,
  isOpen,
  onClose,
}: Props<T>) {
  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="Persistent state" />
      </ModalDialog.Heading>
      <p>
        <FormattedMessage defaultMessage="State definition changes apply when you save the app version." />
      </p>
      <StateDefinitionFields
        control={control as unknown as Control}
        name={name}
      />
      <ModalDialog.Actions>
        <Button variant="primary" onPress={onClose}>
          <FormattedMessage defaultMessage="Done" />
        </Button>
      </ModalDialog.Actions>
    </ModalDialog>
  );
}
