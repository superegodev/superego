import type { ToolCall } from "@superego/backend";
import ConversationUtils from "../../../../utils/ConversationUtils.js";
import CodeBlock from "../../../design-system/CodeBlock/CodeBlock.js";

interface Props {
  toolCall: ToolCall;
}
export default function ToolCallInput({ toolCall }: Props) {
  return ConversationUtils.isExecuteJavascriptFunctionToolCall(toolCall) ||
    ConversationUtils.isRenderChartToolCall(toolCall) ? (
    <CodeBlock
      language="javascript"
      code={
        "javascriptFunction" in toolCall.input
          ? toolCall.input.javascriptFunction
          : toolCall.input.getEchartsOption
      }
      showCopyButton={true}
    />
  ) : (
    <CodeBlock
      language="json"
      code={JSON.stringify(toolCall.input, null, 2)}
      showCopyButton={true}
    />
  );
}
