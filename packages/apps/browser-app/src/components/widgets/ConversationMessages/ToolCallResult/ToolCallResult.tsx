import type {
  ToolCall as ToolCallB,
  ToolResult as ToolResultB,
} from "@superego/backend";
import { useId } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-aria-components";
import { FormattedMessage } from "react-intl";
import Title from "./Title.jsx";
import ToolCall from "./ToolCall.jsx";
import * as cs from "./ToolCallResult.css.js";
import ToolResult from "./ToolResult.jsx";

interface Props {
  toolCall: ToolCallB;
  toolResult: ToolResultB | null;
}
export default function ToolCallResult({ toolCall, toolResult }: Props) {
  const toolCallId = useId();
  const toolResultId = useId();
  return (
    <div className={cs.ToolCallResult.root}>
      <Title toolCall={toolCall} toolResult={toolResult} />
      <Tabs className={cs.ToolCallResult.tabs}>
        <TabList
          aria-label="Input settings"
          className={cs.ToolCallResult.tabsList}
        >
          <Tab id={toolCallId} className={cs.ToolCallResult.tab}>
            <FormattedMessage defaultMessage="Call" />
          </Tab>
          <Tab id={toolResultId} className={cs.ToolCallResult.tab}>
            <FormattedMessage defaultMessage="Result" />
          </Tab>
        </TabList>
        <TabPanel id={toolCallId} className={cs.ToolCallResult.tabPanel}>
          <ToolCall toolCall={toolCall} />
        </TabPanel>
        <TabPanel id={toolResultId} className={cs.ToolCallResult.tabPanel}>
          {toolResult ? (
            <ToolResult toolResult={toolResult} />
          ) : (
            <FormattedMessage defaultMessage="This call has no result." />
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
}
