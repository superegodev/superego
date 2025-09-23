import {
  type Conversation,
  type Message,
  MessageRole,
  type ToolCall,
} from "@superego/backend";
import Markdown from "markdown-to-jsx";
import { useMemo } from "react";
import { Separator } from "react-aria-components";
import ConversationUtils from "../../../../utils/ConversationUtils.js";
import ThinkingTime from "../ThinkingTime.js";
import RenderChart from "../ToolResult/RenderChart.jsx";
import RenderDocumentsTable from "../ToolResult/RenderDocumentsTable.jsx";
import * as cs from "./AssistantContentMessage.css.js";
import RetryButton from "./RetryButton.js";
import SpeakButton from "./SpeakButton.js";

interface Props {
  conversation: Conversation;
  message: Message.ContentAssistant;
}
export default function AssistantContentMessage({
  conversation,
  message,
}: Props) {
  const [textPart] = message.content;
  const Chart = useMemo(
    () =>
      ({ id }: { id: string }) => {
        const toolResult = conversation.messages
          .filter((message) => message.role === MessageRole.Tool)
          .flatMap((message) => message.toolResults)
          .filter(ConversationUtils.isSuccessfulRenderChartToolResult)
          .find((toolResult) => toolResult.artifacts?.chartId === id);
        return toolResult ? (
          <RenderChart toolResult={toolResult} />
        ) : (
          "<ChartNotFound>"
        );
      },
    [conversation],
  );
  const DocumentsTable = useMemo(
    () =>
      ({ id }: { id: string }) => {
        const toolResult = conversation.messages
          .filter((message) => message.role === MessageRole.Tool)
          .flatMap((message) => message.toolResults)
          .filter(ConversationUtils.isSuccessfulRenderDocumentsTableToolResult)
          .find((toolResult) => toolResult.artifacts?.documentsTableId === id);
        return toolResult ? (
          <RenderDocumentsTable
            key={toolResult.toolCallId}
            toolCall={
              ConversationUtils.findToolCall(
                conversation,
                toolResult,
              ) as ToolCall.RenderDocumentsTable
            }
            toolResult={toolResult}
          />
        ) : (
          "<DocumentsTableNotFound>"
        );
      },
    [conversation],
  );
  return (
    <div className={cs.AssistantContentMessage.root}>
      <Markdown
        key={textPart.text}
        className={cs.AssistantContentMessage.markdown}
        options={{
          overrides: {
            iframe: () => null,
            a: { props: { target: "_blank", rel: "noopener noreferrer" } },
            table: (props) => (
              <div className={cs.AssistantContentMessage.markdownTableScroller}>
                <table {...props} />
              </div>
            ),
            Chart,
            DocumentsTable,
          },
        }}
      >
        {textPart.text}
      </Markdown>
      <div className={cs.AssistantContentMessage.infoAndActions}>
        <ThinkingTime message={message} conversation={conversation} />
        <Separator
          orientation="vertical"
          className={cs.AssistantContentMessage.infoAndActionsSeparator}
        />
        <SpeakButton
          message={message}
          className={cs.AssistantContentMessage.infoAndActionsAction}
        />
        <RetryButton
          conversation={conversation}
          message={message}
          className={cs.AssistantContentMessage.infoAndActionsAction}
        />
      </div>
    </div>
  );
}
