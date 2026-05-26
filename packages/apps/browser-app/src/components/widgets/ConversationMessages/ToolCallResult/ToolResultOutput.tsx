import type { ToolResult } from "@superego/backend";
import ConversationUtils from "../../../../utils/ConversationUtils.js";
import CodeBlock from "../../../design-system/CodeBlock/CodeBlock.js";

interface Props {
  toolResult: ToolResult;
}

type LegacyGetCollectionTypescriptSchemaOutputData = {
  typescriptSchema: string;
};

export default function ToolResultOutput({ toolResult }: Props) {
  return ConversationUtils.isSuccessfulGetCollectionTypescriptSchemaToolResult(
    toolResult,
  ) ? (
    <CodeBlock
      language="typescript"
      code={getCollectionTypescriptSchemaOutputCode(toolResult.output.data)}
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

function getCollectionTypescriptSchemaOutputCode(
  data: string | LegacyGetCollectionTypescriptSchemaOutputData,
): string {
  if (typeof data === "string") {
    return data;
  }
  // Support the legacy persisted payload shape for backwards compatibility.
  return data.typescriptSchema;
}
