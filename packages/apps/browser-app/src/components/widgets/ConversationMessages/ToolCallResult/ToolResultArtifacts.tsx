import type { ToolResult } from "@superego/backend";
import CodeBlock from "../../../design-system/CodeBlock/CodeBlock.js";

interface Props {
  toolResult: ToolResult;
}
export default function ToolResultArtifacts({ toolResult }: Props) {
  return (
    <CodeBlock
      language="json"
      code={JSON.stringify(toolResult.artifacts)}
      showCopyButton={true}
    />
  );
}
