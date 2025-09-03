import type { Message } from "@superego/backend";
import { useIntl } from "react-intl";
import JsonDetails from "./JsonDetails.js";

interface Props {
  message: Message.ToolCallAssistant;
  showTechnicalLog: boolean;
}
export default function AssistantToolCallMessage({
  message,
  showTechnicalLog,
}: Props) {
  const intl = useIntl();
  return showTechnicalLog
    ? message.toolCalls.map((toolCall) => (
        <JsonDetails
          key={toolCall.id}
          title={intl.formatMessage({ defaultMessage: "Tool call" })}
          value={toolCall}
        />
      ))
    : null;
}
