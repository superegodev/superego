import {
  type QueuedToast,
  Text,
  UNSTABLE_ToastContent as ToastContentRAC,
  UNSTABLE_Toast as ToastRAC,
} from "react-aria-components";
import { PiXCircleFill } from "react-icons/pi";
import { useIntl } from "react-intl";
import type ToastContent from "../../../business-logic/toasts/ToastContent.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import CodeBlock from "../../design-system/CodeBlock/CodeBlock.js";
import Disclosure from "../../design-system/Disclosure/Disclosure.js";
import IconButton from "../../design-system/IconButton/IconButton.js";
import * as cs from "./ToastRegion.css.js";

interface Props {
  toast: QueuedToast<ToastContent>;
}
export default function Toast({ toast }: Props) {
  const intl = useIntl();
  const { content } = toast;
  return (
    <ToastRAC toast={toast} className={cs.Toast.root[content.type]}>
      <ToastContentRAC className={cs.Toast.toastContent}>
        <Text slot="title" className={cs.Toast.title}>
          {content.title}
        </Text>
        {content.type === ToastType.Error ? (
          <div slot="description" className={cs.Toast.errorDetails}>
            <Disclosure
              title={intl.formatMessage({ defaultMessage: "Details" })}
              titleClassName={cs.Toast.errorDetailsTitle}
            >
              <CodeBlock
                language="json"
                code={JSON.stringify(content.error)}
                showCopyButton={true}
                className={cs.Toast.errorDetailsCodeBlock}
              />
            </Disclosure>
          </div>
        ) : null}
      </ToastContentRAC>
      <IconButton
        variant="invisible"
        label={intl.formatMessage({ defaultMessage: "Close" })}
        slot="close"
        className={cs.Toast.closeButton[content.type]}
      >
        <PiXCircleFill />
      </IconButton>
    </ToastRAC>
  );
}
