import {
  type Conversation,
  type Message,
  MessageRole,
} from "@superego/backend";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import AssistantContentMessage from "./AssistantContentMessage/AssistantContentMessage.js";
import ToolCallResult from "./ToolCallResult/ToolCallResult.js";
import ToolMessage from "./ToolMessage.js";
import UserMessage from "./UserMessage.js";

interface Props {
  message: Message;
  conversation: Conversation;
  showToolCalls: boolean;
}
export default function ConversationMessage({
  message,
  conversation,
  showToolCalls,
}: Props) {
  switch (message.role) {
    case MessageRole.User:
      return <UserMessage message={message} />;
    case MessageRole.Assistant:
      if ("content" in message) {
        return (
          <AssistantContentMessage
            conversation={conversation}
            message={message}
          />
        );
      }
      return showToolCalls
        ? message.toolCalls.map((toolCall) => (
            <ToolCallResult
              key={toolCall.id}
              toolCall={toolCall}
              toolResult={ConversationUtils.findToolResult(
                conversation,
                toolCall,
              )}
            />
          ))
        : null;
    case MessageRole.Tool:
      return <ToolMessage conversation={conversation} message={message} />;
    default:
      return null;
  }
}
