import {
  type CollectionId,
  type Conversation,
  type LiteDocument,
  type Message,
  MessageRole,
} from "@superego/backend";
import type { MarkdownToJSX } from "markdown-to-jsx";
import { useMemo } from "react";
import { Separator } from "react-aria-components";
import ConversationUtils from "../../../../utils/ConversationUtils.js";
import Markdown from "../../../design-system/Markdown/Markdown.js";
import ThinkingTime from "../ThinkingTime.js";
import CreateChart from "../ToolResult/CreateChart.js";
import CreateDocumentsTables from "../ToolResult/CreateDocumentsTables.js";
import CreateMap from "../ToolResult/CreateMap.js";
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
  return (
    <div className={cs.AssistantContentMessage.root}>
      <Markdown text={textPart.text} overrides={overrides} />
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
    const Chart = ({ id }: { id: string }) => {
      const toolResult = conversation.messages
        .filter((message) => message.role === MessageRole.Tool)
        .flatMap((message) => message.toolResults)
        .filter(ConversationUtils.isSuccessfulCreateChartToolResult)
        .find((toolResult) => toolResult.artifacts?.chartId === id);
      return toolResult ? (
        <CreateChart key={id} toolResult={toolResult} />
      ) : (
        `<ChartNotFound id="${id}">`
      );
    };

    const DocumentsTable = ({ id }: { id: string }) => {
      let collectionId: CollectionId | null = null;
      let documents: LiteDocument[] | null = null;
      conversation.messages
        .filter((message) => message.role === MessageRole.Tool)
        .flatMap((message) => message.toolResults)
        .filter(ConversationUtils.isSuccessfulCreateDocumentsTablesToolResult)
        .forEach((toolResult) => {
          Object.entries(toolResult.artifacts?.tables ?? {}).forEach(
            (entry) => {
              if (entry[1].documentsTableId === id) {
                documents = entry[1].documents;
                collectionId = entry[0] as CollectionId;
              }
            },
          );
        });
      return collectionId && documents ? (
        <CreateDocumentsTables
          key={id}
          collectionId={collectionId}
          documents={documents}
        />
      ) : (
        `<DocumentsTableNotFound id="${id}">`
      );
    };

    const GeoJSONMap = ({ id }: { id: string }) => {
      const toolResult = conversation.messages
        .filter((message) => message.role === MessageRole.Tool)
        .flatMap((message) => message.toolResults)
        .filter(ConversationUtils.isSuccessfulCreateMapToolResult)
        .find((toolResult) => toolResult.artifacts?.mapId === id);
      return toolResult ? (
        <CreateMap key={id} toolResult={toolResult} />
      ) : (
        `<MapNotFound id="${id}">`
      );
    };

    return { Chart, DocumentsTable, Map: GeoJSONMap };
  }, [conversation]);
}
