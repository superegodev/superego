import {
  type QueuedToast,
  Text,
  UNSTABLE_ToastContent as ToastContentRAC,
  UNSTABLE_Toast as ToastRAC,
} from "react-aria-components";
import { PiXCircleFill } from "react-icons/pi";
import { useIntl } from "react-intl";
import type ToastContent from "../../../business-logic/toasts/ToastContent.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import * as cs from "./ToastRegion.css.js";

interface Props {
  toast: QueuedToast<ToastContent>;
}
export default function Toast({ toast }: Props) {
  const intl = useIntl();
  return (
    <ToastRAC toast={toast} className={cs.Toast.root[toast.content.type]}>
      <ToastContentRAC className={cs.Toast.toastContent}>
        <Text slot="title" className={cs.Toast.title}>
          {toast.content.title}
        </Text>
        <Text slot="description" className={cs.Toast.description}>
          {toast.content.description}
        </Text>
      </ToastContentRAC>
      <IconButton
        variant="invisible"
        label={intl.formatMessage({ defaultMessage: "Close" })}
        slot="close"
        className={cs.Toast.closeButton[toast.content.type]}
      >
        <PiXCircleFill />
      </IconButton>
    </ToastRAC>
  );
}
