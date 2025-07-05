import type { ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import Heading from "./Heading.js";
import * as cs from "./ModalDialog.css.js";

interface Props {
  isDismissable: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
}
export default function ModalDialog({
  isDismissable,
  isOpen,
  onOpenChange,
  children,
}: Props) {
  return (
    <ModalOverlay
      isDismissable={isDismissable}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={cs.ModalDialog.overlay}
    >
      <Modal className={cs.ModalDialog.modal}>
        <Dialog>{children}</Dialog>
      </Modal>
    </ModalOverlay>
  );
}

ModalDialog.Heading = Heading;
