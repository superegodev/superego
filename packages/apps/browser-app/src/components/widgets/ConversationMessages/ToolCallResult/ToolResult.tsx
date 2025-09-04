import type { ToolResult as ToolResultB } from "@superego/backend";
import ConversationUtils from "../../../../utils/ConversationUtils.js";
import CodeBlock from "../../../design-system/CodeBlock/CodeBlock.jsx";

interface Props {
  toolResult: ToolResultB;
}
export default function ToolResult({ toolResult }: Props) {
  return (
    <div>
      {ConversationUtils.isSuccessfulGetCollectionTypescriptSchemaToolResult(
        toolResult,
      ) ? (
        <CodeBlock
          language="typescript"
          code={toolResult.output.data.typescriptSchema}
        />
      ) : (
        <CodeBlock
          language="json"
          code={JSON.stringify(
            toolResult.output.success
              ? toolResult.output.data
              : toolResult.output.error,
            null,
            2,
          )}
        />
      )}
    </div>
  );
}
