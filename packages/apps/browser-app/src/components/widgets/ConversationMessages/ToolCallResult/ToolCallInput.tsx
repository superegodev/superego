import type { ToolCall } from "@superego/backend";
import ConversationUtils from "../../../../utils/ConversationUtils.js";
import CodeBlock from "../../../design-system/CodeBlock/CodeBlock.js";

interface Props {
  toolCall: ToolCall;
}
export default function ToolCallInput({ toolCall }: Props) {
  return ConversationUtils.isExecuteTypescriptFunctionToolCall(toolCall) ||
    ConversationUtils.isCreateChartToolCall(toolCall) ||
    ConversationUtils.isCreateDocumentsTableToolCall(toolCall) ? (
    <CodeBlock
      language="typescript"
      code={
        "typescriptFunction" in toolCall.input
          ? toolCall.input.typescriptFunction
          : "getEChartsOption" in toolCall.input
            ? toolCall.input.getEChartsOption
            : toolCall.input.getDocumentIds
      }
      showCopyButton={true}
    />
  ) : (
    <CodeBlock
      language="json"
      code={JSON.stringify(toolCall.input)}
      showCopyButton={true}
    />
  );
}
