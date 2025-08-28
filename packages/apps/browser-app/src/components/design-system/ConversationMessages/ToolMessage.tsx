import type { Message } from "@superego/backend";
import { Disclosure, DisclosurePanel } from "react-aria-components";
import { PiCaretDown, PiCaretRight } from "react-icons/pi";
import { FormattedMessage } from "react-intl";
import Button from "../Button/Button.jsx";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  message: Message.Tool;
}
export default function ToolMessage({ message }: Props) {
  return (
    <Disclosure>
      {({ isExpanded }) => (
        <>
          <Button
            slot="trigger"
            variant="invisible"
            className={cs.ToolMessage.disclosureTrigger}
          >
            {isExpanded ? <PiCaretDown /> : <PiCaretRight />}
            <FormattedMessage defaultMessage="Tool results" />
          </Button>
          <DisclosurePanel>
            <pre className={cs.ToolMessage.pre}>
              <code className={cs.ToolMessage.code}>
                {JSON.stringify(message.toolResults, null, 2)}
              </code>
            </pre>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
