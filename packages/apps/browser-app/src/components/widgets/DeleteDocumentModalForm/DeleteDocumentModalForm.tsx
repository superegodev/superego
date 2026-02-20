import type { CollectionId, DocumentId } from "@superego/backend";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { getDocumentQuery } from "../../../business-logic/backend/hooks.js";
import ModalDialog from "../../design-system/ModalDialog/ModalDialog.js";
import ModalContent from "./ModalContent.js";

interface Props {
  collectionId: CollectionId;
  documentId: DocumentId;
  isOpen: boolean;
  onClose: () => void;
}
export default function DeleteDocumentModalForm({
  collectionId,
  documentId,
  isOpen,
  onClose,
}: Props) {
  return (
    <ModalDialog isDismissable={true} isOpen={isOpen} onOpenChange={onClose}>
      {isOpen ? (
        <DataLoader queries={[getDocumentQuery([collectionId, documentId])]}>
          {(document) => <ModalContent document={document} onClose={onClose} />}
        </DataLoader>
      ) : null}
    </ModalDialog>
  );
}
