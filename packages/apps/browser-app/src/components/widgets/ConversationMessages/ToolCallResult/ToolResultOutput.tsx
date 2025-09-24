import type { ToolResult } from "@superego/backend";
import ConversationUtils from "../../../../utils/ConversationUtils.js";
import CodeBlock from "../../../design-system/CodeBlock/CodeBlock.js";

interface Props {
  toolResult: ToolResult;
}
export default function ToolResultOutput({ toolResult }: Props) {
  return ConversationUtils.isSuccessfulGetCollectionTypescriptSchemaToolResult(
    toolResult,
  ) ? (
    <CodeBlock
      language="typescript"
      code={toolResult.output.data.typescriptSchema}
      showCopyButton={true}
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
      showCopyButton={true}
    />
  );
}
