import type { Message } from "@superego/backend";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  message: Message.Tool;
}
export default function ToolMessage({ message }: Props) {
  const m: Message.Tool = JSON.parse(JSON.stringify(message));
  m.toolResults.forEach((toolResult) => {
    if (
      "data" in toolResult.output &&
      "typescriptSchema" in toolResult.output.data
    ) {
      toolResult.output.data.typescriptSchema === "REDACTED";
    }
  });
  return (
    <div className={cs.ToolMessage.root}>
      <pre>
        <code>{JSON.stringify(message.toolResults, null, 2)}</code>
      </pre>
    </div>
  );
}
