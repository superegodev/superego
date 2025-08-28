import type { Message } from "@superego/backend";
import { Disclosure, DisclosurePanel } from "react-aria-components";
import { PiCaretDown, PiCaretRight } from "react-icons/pi";
import { FormattedMessage } from "react-intl";
import Button from "../Button/Button.jsx";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  message: Message.ToolCallAssistant;
}
export default function AssistantToolCallMessage({ message }: Props) {
  return (
    <Disclosure>
      {({ isExpanded }) => (
        <>
          <Button
            slot="trigger"
            variant="invisible"
            className={cs.AssistantToolCallMessage.disclosureTrigger}
          >
            {isExpanded ? <PiCaretDown /> : <PiCaretRight />}
            <FormattedMessage defaultMessage="Tool calls" />
          </Button>
          <DisclosurePanel>
            <pre className={cs.AssistantToolCallMessage.pre}>
              <code className={cs.AssistantToolCallMessage.code}>
                {JSON.stringify(message.toolCalls, null, 2)}
              </code>
            </pre>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
