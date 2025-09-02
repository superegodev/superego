import { type Message, MessageRole } from "@superego/backend";
import AssistantContentMessage from "./AssistantContentMessage.jsx";
import AssistantToolCallMessage from "./AssistantToolCallMessage.jsx";
import ToolMessage from "./ToolMessage.jsx";
import UserMessage from "./UserMessage.jsx";

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
