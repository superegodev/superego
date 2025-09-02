import type { Message } from "@superego/backend";
import { Fragment } from "react";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import CreateDocumentForCollection from "./successful-tool-results/CreateDocumentForCollection.jsx";
import TechnicalToolCallOrResult from "./TechnicalToolCallOrResult.jsx";

interface Props {
  message: Message.Tool;
  showTechnicalLog: boolean;
}
export default function ToolMessage({ message, showTechnicalLog }: Props) {
  return message.toolResults.map((toolResult) => (
    <Fragment key={toolResult.toolCallId}>
      {ConversationUtils.isSuccessfulCreateDocumentForCollectionToolResult(
        toolResult,
      ) ? (
        <CreateDocumentForCollection toolResult={toolResult} />
      ) : showTechnicalLog ? (
        <TechnicalToolCallOrResult toolResult={toolResult} />
      ) : null}
    </Fragment>
  ));
}
