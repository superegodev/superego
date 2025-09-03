import type { Message } from "@superego/backend";
import { Fragment } from "react";
import { useIntl } from "react-intl";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import JsonDetails from "./JsonDetails.js";
import CreateDocument from "./successful-tool-result/CreateDocument.js";

interface Props {
  message: Message.Tool;
  showTechnicalLog: boolean;
}
export default function ToolMessage({ message, showTechnicalLog }: Props) {
  const intl = useIntl();
  return message.toolResults.map((toolResult) => (
    <Fragment key={toolResult.toolCallId}>
      {ConversationUtils.isSuccessfulCreateDocumentToolResult(toolResult) ? (
        <CreateDocument toolResult={toolResult} />
      ) : showTechnicalLog ? (
        <JsonDetails
          title={intl.formatMessage({ defaultMessage: "Tool result" })}
          value={toolResult}
        />
      ) : null}
    </Fragment>
  ));
}
