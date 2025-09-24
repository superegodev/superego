import {
  type Conversation,
  type Message,
  MessageRole,
  type ToolCall,
} from "@superego/backend";
import Markdown, { type MarkdownToJSX } from "markdown-to-jsx";
import { type TableHTMLAttributes, useMemo } from "react";
import { Separator } from "react-aria-components";
import ConversationUtils from "../../../../utils/ConversationUtils.js";
import ThinkingTime from "../ThinkingTime.js";
import CreateChart from "../ToolResult/CreateChart.jsx";
import CreateDocumentsTable from "../ToolResult/CreateDocumentsTable.jsx";
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
  const overrides = useOverrides(conversation);
  const options = useMemo(() => ({ overrides }), [overrides]);
  return (
    <div className={cs.AssistantContentMessage.root}>
      <Markdown
        key={textPart.text}
        className={cs.AssistantContentMessage.markdown}
        options={options}
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

function useOverrides(conversation: Conversation): MarkdownToJSX.Overrides {
  return useMemo(() => {
    const iframe = () => null;

    const a = { props: { target: "_blank", rel: "noopener noreferrer" } };

    const table = (props: TableHTMLAttributes<HTMLTableElement>) => (
      <div className={cs.AssistantContentMessage.markdownTableScroller}>
        <table {...props} />
      </div>
    );

    const Chart = ({ id }: { id: string }) => {
      const toolResult = conversation.messages
        .filter((message) => message.role === MessageRole.Tool)
        .flatMap((message) => message.toolResults)
        .filter(ConversationUtils.isSuccessfulCreateChartToolResult)
        .find((toolResult) => toolResult.artifacts?.chartId === id);
      return toolResult ? (
        <CreateChart toolResult={toolResult} />
      ) : (
        `<ChartNotFound id="${id}">`
      );
    };

    const DocumentsTable = ({ id }: { id: string }) => {
      const toolResult = conversation.messages
        .filter((message) => message.role === MessageRole.Tool)
        .flatMap((message) => message.toolResults)
        .filter(ConversationUtils.isSuccessfulCreateDocumentsTableToolResult)
        .find((toolResult) => toolResult.artifacts?.documentsTableId === id);
      return toolResult ? (
        <CreateDocumentsTable
          key={toolResult.toolCallId}
          toolCall={
            ConversationUtils.findToolCall(
              conversation,
              toolResult,
            ) as ToolCall.CreateDocumentsTable
          }
          toolResult={toolResult}
        />
      ) : (
        `<DocumentsTableNotFound id="${id}">`
      );
    };

    return { iframe, a, table, Chart, DocumentsTable };
  }, [conversation]);
}
