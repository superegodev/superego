import type { Message } from "@superego/backend";
import { Fragment } from "react";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import CreateDocument from "./successful-tool-result/CreateDocument.jsx";
import TechnicalToolCallOrResult from "./TechnicalToolCallOrResult.js";

interface Props {
  message: Message.Tool;
  showTechnicalLog: boolean;
}
export default function ToolMessage({ message, showTechnicalLog }: Props) {
  return message.toolResults.map((toolResult) => (
    <Fragment key={toolResult.toolCallId}>
      {ConversationUtils.isSuccessfulCreateDocumentToolResult(toolResult) ? (
        <CreateDocument toolResult={toolResult} />
      ) : showTechnicalLog ? (
        <TechnicalToolCallOrResult toolResult={toolResult} />
      ) : null}
    </Fragment>
  ));
}
