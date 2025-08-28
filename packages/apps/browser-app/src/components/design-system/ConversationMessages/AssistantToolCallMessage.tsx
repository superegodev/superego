import type { Message } from "@superego/backend";
import * as cs from "./ConversationMessages.css.js";

interface Props {
  message: Message.ToolCallAssistant;
}
export default function AssistantToolCallMessage({ message }: Props) {
  return (
    <div className={cs.AssistantToolCallMessage.root}>
      <pre>
        <code>{JSON.stringify(message.toolCalls, null, 2)}</code>
      </pre>
    </div>
  );
}
