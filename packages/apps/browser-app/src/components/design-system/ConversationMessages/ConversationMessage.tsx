import { type Message, MessageRole } from "@superego/backend";
import AssistantContentMessage from "./AssistantContentMessage.jsx";
import AssistantToolCallMessage from "./AssistantToolCallMessage.jsx";
import ToolMessage from "./ToolMessage.jsx";
import UserMessage from "./UserMessage.jsx";

interface Props {
  message: Message;
}
export default function ConversationMessage({ message }: Props) {
  switch (message.role) {
    case MessageRole.User:
      return <UserMessage message={message} />;
    case MessageRole.Assistant:
      return "content" in message ? (
        <AssistantContentMessage message={message} />
      ) : (
        <AssistantToolCallMessage message={message} />
      );
    case MessageRole.Tool:
      return <ToolMessage message={message} />;
    default:
      return null;
  }
}
