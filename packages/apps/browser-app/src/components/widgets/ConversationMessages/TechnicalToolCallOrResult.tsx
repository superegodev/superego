import type { ToolCall, ToolResult } from "@superego/backend";
import { Disclosure, DisclosurePanel } from "react-aria-components";
import { PiCaretDown, PiCaretRight } from "react-icons/pi";
import { FormattedMessage } from "react-intl";
import Button from "../../design-system/Button/Button.js";
import * as cs from "./ConversationMessages.css.js";

type Props =
  | { toolCall?: null; toolResult: ToolResult }
  | { toolCall: ToolCall; toolResult?: null };
export default function TechnicalToolCallOrResult({
  toolCall,
  toolResult,
}: Props) {
  return (
    <Disclosure>
      {({ isExpanded }) => (
        <>
          <Button
            slot="trigger"
            variant="invisible"
            className={cs.TechnicalToolCallOrResult.disclosureTrigger}
          >
            {isExpanded ? <PiCaretDown /> : <PiCaretRight />}
            {toolCall ? (
              <FormattedMessage defaultMessage="Tool call" />
            ) : (
              <FormattedMessage defaultMessage="Tool result" />
            )}
          </Button>
          <DisclosurePanel>
            <pre className={cs.TechnicalToolCallOrResult.pre}>
              <code className={cs.TechnicalToolCallOrResult.code}>
                {JSON.stringify(toolCall ?? toolResult, null, 2)}
              </code>
            </pre>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
