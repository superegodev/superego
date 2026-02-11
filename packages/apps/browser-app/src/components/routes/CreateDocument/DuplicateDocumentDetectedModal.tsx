import type { DuplicateDocumentDetected } from "@superego/backend";
import { FormattedMessage } from "react-intl";
import Button from "../../design-system/Button/Button.js";
import ContentSummary from "../../design-system/ContentSummary/ContentSummary.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import * as cs from "./CreateDocument.css.js";

interface Props {
  error: DuplicateDocumentDetected;
  isOpen: boolean;
  onClose: () => void;
  onCreateAnyway: () => void;
  isCreating: boolean;
}
export default function DuplicateDocumentDetectedModal({
  error,
  isOpen,
  onClose,
  onCreateAnyway,
  isCreating,
}: Props) {
  return (
    <ModalDialog
      isDismissable={!isCreating}
      isOpen={isOpen}
      onOpenChange={onClose}
    >
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="Possible duplicate detected" />
      </ModalDialog.Heading>
      <p>
        <FormattedMessage defaultMessage="A document with similar content already exists in this collection:" />
      </p>
      <div className={cs.DuplicateDocumentDetectedModal.duplicateDocument}>
        <ContentSummary
          contentSummary={
            error.details.duplicateDocument.latestVersion.contentSummary
          }
        />
      </div>
      <p>
        <FormattedMessage defaultMessage="Do you still want to create this document?" />
      </p>
      <ModalDialog.Actions>
        <Button onPress={onClose} isDisabled={isCreating}>
          <FormattedMessage defaultMessage="Cancel" />
        </Button>
        <Button
          variant="primary"
          onPress={onCreateAnyway}
          isDisabled={isCreating}
        >
          <FormattedMessage defaultMessage="Create anyway" />
        </Button>
      </ModalDialog.Actions>
    </ModalDialog>
  );
}
