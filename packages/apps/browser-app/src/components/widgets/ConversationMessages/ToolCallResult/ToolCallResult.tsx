import type { ToolCall, ToolResult } from "@superego/backend";
import { Button, Disclosure, DisclosurePanel } from "react-aria-components";
import { FormattedMessage } from "react-intl";
import Title from "./Title.js";
import ToolCallInput from "./ToolCallInput.js";
import * as cs from "./ToolCallResult.css.js";
import ToolResultArtifacts from "./ToolResultArtifacts.js";
import ToolResultOutput from "./ToolResultOutput.js";

interface Props {
  toolCall: ToolCall;
  toolResult: ToolResult | null;
}
export default function ToolCallResult({ toolCall, toolResult }: Props) {
  const rootVariant = toolResult
    ? toolResult.output.success
      ? "succeeded"
      : "failed"
    : "noResult";
  return (
    <div className={cs.ToolCallResult.root[rootVariant]}>
      <Disclosure>
        <Button slot="trigger" className={cs.ToolCallResult.triggerButton}>
          <Title toolCall={toolCall} toolResult={toolResult} />
        </Button>
        <DisclosurePanel>
          <div className={cs.ToolCallResult.callInput}>
            <ToolCallInput toolCall={toolCall} />
          </div>
          <div className={cs.ToolCallResult.resultOutput}>
            {toolResult ? (
              <ToolResultOutput toolResult={toolResult} />
            ) : (
              <FormattedMessage defaultMessage="This call has no result." />
            )}
          </div>
          {toolResult && "artifacts" in toolResult ? (
            <div className={cs.ToolCallResult.resultArtifacts}>
              <ToolResultArtifacts toolResult={toolResult} />
            </div>
          ) : null}
        </DisclosurePanel>
      </Disclosure>
    </div>
  );
}
