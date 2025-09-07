import {
  type Conversation,
  type Message,
  MessageRole,
} from "@superego/backend";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import AssistantContentMessage from "./AssistantContentMessage.js";
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
            message={message}
            conversation={conversation}
          />
        );
      }
      return (
        <>
          {/* EVOLUTION: tool call messages like viz.renderChart will be rendered here. */}
          {showToolCalls ? (
            <ToolCallResults message={message} conversation={conversation} />
          ) : null}
        </>
      );
    case MessageRole.Tool:
      return <ToolMessage message={message} />;
    default:
      return null;
  }
}

function ToolCallResults({
  message,
  conversation,
}: {
  message: Message.ToolCallAssistant;
  conversation: Conversation;
}) {
  return message.toolCalls.map((toolCall) => (
    <ToolCallResult
      key={toolCall.id}
      toolCall={toolCall}
      toolResult={ConversationUtils.findToolResult(conversation, toolCall)}
    />
  ));
}
