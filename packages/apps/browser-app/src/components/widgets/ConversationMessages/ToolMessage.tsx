import type { Conversation, Message, ToolCall } from "@superego/backend";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import CreateDocumentOrVersion from "./ToolResult/CreateDocumentOrVersion.js";
import RenderChart from "./ToolResult/RenderChart.js";
import SuggestCollectionDefinition from "./ToolResult/SuggestCollectionDefinition.js";

interface Props {
  conversation: Conversation;
  message: Message.Tool;
}
export default function ToolMessage({ conversation, message }: Props) {
  return message.toolResults.map((toolResult) => {
    if (
      ConversationUtils.isSuccessfulCreateDocumentToolResult(toolResult) ||
      ConversationUtils.isSuccessfulCreateNewDocumentVersionToolResult(
        toolResult,
      )
    ) {
      return (
        <CreateDocumentOrVersion
          key={toolResult.toolCallId}
          toolResult={toolResult}
        />
      );
    }

    if (
      ConversationUtils.isSuccessfulSuggestCollectionDefinitionToolResult(
        toolResult,
      )
    ) {
      return (
        <SuggestCollectionDefinition
          key={toolResult.toolCallId}
          conversation={conversation}
          toolCall={
            ConversationUtils.findToolCall(
              conversation,
              toolResult,
            ) as ToolCall.SuggestCollectionDefinition
          }
          toolResult={toolResult}
        />
      );
    }

    if (ConversationUtils.isSuccessfulRenderChartToolResult(toolResult)) {
      return (
        <RenderChart key={toolResult.toolCallId} toolResult={toolResult} />
      );
    }

    return null;
  });
}
