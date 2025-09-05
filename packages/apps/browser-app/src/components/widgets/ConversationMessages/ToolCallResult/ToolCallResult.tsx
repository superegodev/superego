import type {
  ToolCall as ToolCallB,
  ToolResult as ToolResultB,
} from "@superego/backend";
import { Button, Disclosure, DisclosurePanel } from "react-aria-components";
import { FormattedMessage } from "react-intl";
import { vars } from "../../../../themes.css.js";
import Title from "./Title.jsx";
import ToolCall from "./ToolCall.jsx";
import * as cs from "./ToolCallResult.css.js";
import ToolResult from "./ToolResult.jsx";

interface Props {
  toolCall: ToolCallB;
  toolResult: ToolResultB | null;
}
export default function ToolCallResult({ toolCall, toolResult }: Props) {
  const background = toolResult
    ? toolResult.output.success
      ? vars.colors.greens._1
      : vars.colors.reds._1
    : vars.colors.yellows._1;
  return (
    <div className={cs.ToolCallResult.root} style={{ background }}>
      <Disclosure>
        <Button slot="trigger" className={cs.ToolCallResult.triggerButton}>
          <Title toolCall={toolCall} toolResult={toolResult} />
        </Button>
        <DisclosurePanel>
          <div className={cs.ToolCallResult.call}>
            <ToolCall toolCall={toolCall} />
          </div>
          <div className={cs.ToolCallResult.result}>
            {toolResult ? (
              <ToolResult toolResult={toolResult} />
            ) : (
              <FormattedMessage defaultMessage="This call has no result." />
            )}
          </div>
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
