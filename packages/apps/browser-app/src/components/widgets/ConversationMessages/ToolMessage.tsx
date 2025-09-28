import type { Conversation, Message, ToolCall } from "@superego/backend";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import CreateDocuments from "./ToolResult/CreateDocuments.js";
import CreateNewDocumentVersion from "./ToolResult/CreateNewDocumentVersion.js";
import SuggestCollectionDefinition from "./ToolResult/SuggestCollectionDefinition.js";

interface Props {
  conversation: Conversation;
  message: Message.Tool;
}
export default function ToolMessage({ conversation, message }: Props) {
  return message.toolResults.map((toolResult) => {
    if (ConversationUtils.isSuccessfulCreateDocumentsToolResult(toolResult)) {
      return (
        <CreateDocuments key={toolResult.toolCallId} toolResult={toolResult} />
      );
    }

    if (
      ConversationUtils.isSuccessfulCreateNewDocumentVersionToolResult(
        toolResult,
      )
    ) {
      return (
        <CreateNewDocumentVersion
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

    return null;
  });
}
