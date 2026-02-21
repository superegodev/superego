import type { ToolCall } from "@superego/backend";
import ConversationUtils from "../../../../utils/ConversationUtils.js";
import CodeBlock from "../../../design-system/CodeBlock/CodeBlock.js";

interface Props {
  toolCall: ToolCall;
}
export default function ToolCallInput({ toolCall }: Props) {
  return ConversationUtils.isExecuteTypescriptFunctionToolCall(toolCall) ||
    ConversationUtils.isCreateChartToolCall(toolCall) ||
    ConversationUtils.isCreateGeoJSONMapToolCall(toolCall) ||
    ConversationUtils.isCreateDocumentsTablesToolCall(toolCall) ? (
    <CodeBlock
      language="typescript"
      code={
        "typescriptFunction" in toolCall.input
          ? toolCall.input.typescriptFunction
          : "getEChartsOption" in toolCall.input
            ? toolCall.input.getEChartsOption
            : "getGeoJSON" in toolCall.input
              ? toolCall.input.getGeoJSON
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
