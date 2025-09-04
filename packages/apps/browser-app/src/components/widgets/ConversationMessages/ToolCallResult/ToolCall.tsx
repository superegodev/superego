import type { ToolCall as ToolCallB } from "@superego/backend";
import ConversationUtils from "../../../../utils/ConversationUtils.js";
import CodeBlock from "../../../design-system/CodeBlock/CodeBlock.js";

interface Props {
  toolCall: ToolCallB;
}
export default function ToolCall({ toolCall }: Props) {
  return (
    <div>
      {ConversationUtils.isExecuteJavascriptFunctionToolCall(toolCall) ? (
        <CodeBlock
          language="javascript"
          code={toolCall.input.javascriptFunction}
        />
      ) : (
        <CodeBlock
          language="json"
          code={JSON.stringify(toolCall.input, null, 2)}
        />
      )}
    </div>
  );
}
