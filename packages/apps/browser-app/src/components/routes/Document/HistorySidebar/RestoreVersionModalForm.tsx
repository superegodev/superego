import type { Collection, Document, DocumentVersion } from "@superego/backend";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useCreateNewDocumentVersion } from "../../../../business-logic/backend/hooks.js";
import Button from "../../../design-system/Button/Button.js";
import ModalDialog from "../../../design-system/ModalDialog/ModalDialog.js";
import ResultErrors from "../../../design-system/ResultErrors/ResultErrors.js";
import * as cs from "./HistorySidebar.css.js";

interface Props {
  collection: Collection;
  document: Document;
  versionToRestore: DocumentVersion;
  isOpen: boolean;
  onClose: () => void;
  onRestored: () => void;
}

export default function RestoreVersionModalForm({
  collection,
  document,
  versionToRestore,
  isOpen,
  onClose,
  onRestored,
}: Props) {
  const intl = useIntl();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { result, mutate } = useCreateNewDocumentVersion();

  const versionDate = new Date(versionToRestore.createdAt);
  const formattedDate = intl.formatDate(versionDate, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const handleRestore = async () => {
    setIsSubmitting(true);
    const { success } = await mutate(
      collection.id,
      document.id,
      document.latestVersion.id,
      versionToRestore.content,
    );
    setIsSubmitting(false);
    if (success) {
      onRestored();
      onClose();
    }
  };

  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="Restore version" />
      </ModalDialog.Heading>
      <div className={cs.RestoreVersionModalForm.content}>
        <FormattedMessage
          defaultMessage="Restore version from {date}? This will create a new version with the content from that point in time. The current version will be preserved in history."
          values={{ date: formattedDate }}
        />
      </div>
      <div className={cs.RestoreVersionModalForm.buttonContainer}>
        <Button variant="default" onPress={onClose}>
          <FormattedMessage defaultMessage="Cancel" />
        </Button>
        <Button
          variant="primary"
          onPress={handleRestore}
          isDisabled={isSubmitting}
        >
          <FormattedMessage defaultMessage="Restore" />
        </Button>
      </div>
      {result?.error ? <ResultErrors errors={[result.error]} /> : null}
    </ModalDialog>
  );
}
