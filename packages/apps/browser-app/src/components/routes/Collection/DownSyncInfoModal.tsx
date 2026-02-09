import type { Collection, Remote } from "@superego/backend";
import { FormattedMessage } from "react-intl";
import toTitleCase from "../../../utils/toTitleCase.js";
import Button from "../../design-system/Button/Button.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../design-system/ResultErrors/ResultErrors.js";

interface Props {
  collection: Collection & { remote: Remote };
  isOpen: boolean;
  onClose: () => void;
  onTriggerDownSync: () => void;
}
export default function DownSyncInfoModal({
  collection,
  isOpen,
  onClose,
  onTriggerDownSync,
}: Props) {
  // Note: for the moment this modal is only opened to show errors, so it only
  // contains that.
  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage
          defaultMessage="Syncing with {remote}"
          values={{ remote: toTitleCase(collection.remote.connector.name) }}
        />
      </ModalDialog.Heading>
      {collection.remote.syncState.down.error ? (
        <ResultErrors errors={[collection.remote.syncState.down.error]} />
      ) : null}
      <ModalDialog.Actions>
        <Button onPress={onClose}>
          <FormattedMessage defaultMessage="Cancel" />
        </Button>
        <Button
          variant="primary"
          onPress={() => {
            onClose();
            onTriggerDownSync();
          }}
        >
          <FormattedMessage defaultMessage="Sync" />
        </Button>
      </ModalDialog.Actions>
    </ModalDialog>
  );
}
