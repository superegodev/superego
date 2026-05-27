import type { Document } from "@superego/backend";
import { FormattedDate, FormattedMessage } from "react-intl";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import * as cs from "./Document.css.js";

interface Props {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
}
export default function DocumentInfoModal({
  document,
  isOpen,
  onClose,
}: Props) {
  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage defaultMessage="Document info" />
      </ModalDialog.Heading>
      <dl className={cs.DocumentInfoModal.infoProperties}>
        <div className={cs.DocumentInfoModal.infoProperty}>
          <dt className={cs.DocumentInfoModal.infoPropertyName}>
            <FormattedMessage defaultMessage="Collection ID:" />
          </dt>
          <dd className={cs.DocumentInfoModal.infoPropertyValue.id}>
            {document.collectionId}
          </dd>
        </div>
        <div className={cs.DocumentInfoModal.infoProperty}>
          <dt className={cs.DocumentInfoModal.infoPropertyName}>
            <FormattedMessage defaultMessage="Document ID:" />
          </dt>
          <dd className={cs.DocumentInfoModal.infoPropertyValue.id}>
            {document.id}
          </dd>
        </div>
        <div className={cs.DocumentInfoModal.infoProperty}>
          <dt className={cs.DocumentInfoModal.infoPropertyName}>
            <FormattedMessage defaultMessage="Created at:" />
          </dt>
          <dd className={cs.DocumentInfoModal.infoPropertyValue.date}>
            <FormattedDate
              value={document.createdAt}
              dateStyle="short"
              timeStyle="short"
            />
          </dd>
        </div>
        <div className={cs.DocumentInfoModal.infoProperty}>
          <dt className={cs.DocumentInfoModal.infoPropertyName}>
            <FormattedMessage defaultMessage="Last modified at:" />
          </dt>
          <dd className={cs.DocumentInfoModal.infoPropertyValue.date}>
            <FormattedDate
              value={document.latestVersion.createdAt}
              dateStyle="short"
              timeStyle="short"
            />
          </dd>
        </div>
      </dl>
    </ModalDialog>
  );
}
