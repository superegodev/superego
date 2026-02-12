import type { ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import Actions from "./Actions.js";
import Heading from "./Heading.js";
import * as cs from "./ModalDialog.css.js";

interface Props {
  isDismissable: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  modalClassName?: string | undefined;
  children: ReactNode;
}
export default function ModalDialog({
  isDismissable,
  isOpen,
  onOpenChange,
  modalClassName,
  children,
}: Props) {
  return (
    <ModalOverlay
      isDismissable={isDismissable}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={cs.ModalDialog.overlay}
    >
      <Modal className={classnames(cs.ModalDialog.modal, modalClassName)}>
        <Dialog>{children}</Dialog>
      </Modal>
    </ModalOverlay>
  );
}

ModalDialog.Heading = Heading;
ModalDialog.Actions = Actions;
