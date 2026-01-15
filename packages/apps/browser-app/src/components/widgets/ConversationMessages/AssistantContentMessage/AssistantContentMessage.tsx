import {
  type CollectionId,
  type Conversation,
  type LiteDocument,
  type Message,
  MessageRole,
} from "@superego/backend";
import Markdown, { type MarkdownToJSX } from "markdown-to-jsx";
import {
  type AnchorHTMLAttributes,
  type TableHTMLAttributes,
  useMemo,
} from "react";
import { Separator } from "react-aria-components";
import ConversationUtils from "../../../../utils/ConversationUtils.js";
import Link from "../../../design-system/Link/Link.js";
import ThinkingTime from "../ThinkingTime.js";
import CreateChart from "../ToolResult/CreateChart.js";
import CreateDocumentsTables from "../ToolResult/CreateDocumentsTables.js";
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
  const options = useMemo<MarkdownToJSX.Options>(
    () => ({
      wrapper: "div",
      forceWrapper: true,
      overrides,
    }),
    [overrides],
  );
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

    const a = ({ href, children }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
      href?.startsWith("/") && href ? (
        <Link href={href}>{children}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );

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

    return { iframe, a, table, Chart, DocumentsTable };
  }, [conversation]);
}
