import type { Collection, Document } from "@superego/backend";
import { FormattedMessage } from "react-intl";
import toTitleCase from "../../../utils/toTitleCase.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.jsx";
import * as cs from "./Document.css.js";

interface Props {
  collection: Collection;
  document: Document;
  isOpen: boolean;
  onClose: () => void;
}
export default function RemoteDocumentInfoModal({
  collection,
  document,
  isOpen,
  onClose,
}: Props) {
  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      <ModalDialog.Heading>
        <FormattedMessage
          defaultMessage="Synced with {remote}"
          values={{
            remote: toTitleCase(collection.remote?.connector.name ?? "-"),
          }}
        />
      </ModalDialog.Heading>
      <dl className={cs.RemoteDocumentInfoModal.infoProperties}>
        <div className={cs.RemoteDocumentInfoModal.infoProperty}>
          <dt className={cs.RemoteDocumentInfoModal.infoPropertyName}>
            <FormattedMessage defaultMessage="Remote document ID:" />
          </dt>
          <dd className={cs.RemoteDocumentInfoModal.infoPropertyValue}>
            {document.remoteId ?? "-"}
          </dd>
        </div>
        <div className={cs.RemoteDocumentInfoModal.infoProperty}>
          <dt className={cs.RemoteDocumentInfoModal.infoPropertyName}>
            <FormattedMessage defaultMessage="Remote document version ID:" />
          </dt>
          <dd className={cs.RemoteDocumentInfoModal.infoPropertyValue}>
            {document.latestVersion.remoteId ?? "-"}
          </dd>
        </div>
      </dl>
    </ModalDialog>
  );
}
