import { type Message, MessageRole } from "@superego/backend";
import AssistantContentMessage from "./AssistantContentMessage.js";
import AssistantToolCallMessage from "./AssistantToolCallMessage.js";
import ToolMessage from "./ToolMessage.js";
import UserMessage from "./UserMessage.js";

interface Props {
  message: Message;
  showTechnicalLog: boolean;
}
export default function ConversationMessage({
  message,
  showTechnicalLog,
}: Props) {
  switch (message.role) {
    case MessageRole.User:
      return <UserMessage message={message} />;
    case MessageRole.Assistant:
      return "content" in message ? (
        <AssistantContentMessage message={message} />
      ) : (
        <AssistantToolCallMessage
          message={message}
          showTechnicalLog={showTechnicalLog}
        />
      );
    case MessageRole.Tool:
      return (
        <ToolMessage message={message} showTechnicalLog={showTechnicalLog} />
      );
    default:
      return null;
  }
}
