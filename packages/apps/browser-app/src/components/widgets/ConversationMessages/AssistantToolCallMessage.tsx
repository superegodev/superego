import type { Message } from "@superego/backend";
import TechnicalToolCallOrResult from "./TechnicalToolCallOrResult.jsx";

interface Props {
  message: Message.ToolCallAssistant;
  showTechnicalLog: boolean;
}
export default function AssistantToolCallMessage({
  message,
  showTechnicalLog,
}: Props) {
  return showTechnicalLog
    ? message.toolCalls.map((toolCall) => (
        <TechnicalToolCallOrResult key={toolCall.id} toolCall={toolCall} />
      ))
    : null;
}
