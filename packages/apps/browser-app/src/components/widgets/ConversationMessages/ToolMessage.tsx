import type { Message } from "@superego/backend";
import { Fragment } from "react";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import SuccessfulCreateDocumentOrVersion from "./ToolResult/SuccessfulCreateDocumentOrCreateNewDocumentVersion.js";

interface Props {
  message: Message.Tool;
}
export default function ToolMessage({ message }: Props) {
  return message.toolResults.map((toolResult) => (
    <Fragment key={toolResult.toolCallId}>
      {ConversationUtils.isSuccessfulCreateDocumentToolResult(toolResult) ||
      ConversationUtils.isSuccessfulCreateNewDocumentVersionToolResult(
        toolResult,
      ) ? (
        <SuccessfulCreateDocumentOrVersion toolResult={toolResult} />
      ) : null}
    </Fragment>
  ));
}
