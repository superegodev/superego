import {
  type Conversation,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import type { IntlShape } from "react-intl";

const DISPLAY_NAME_LENGTH = 16;

export default {
  getDisplayTitle(
    { title }: Pick<Conversation, "title">,
    intl: IntlShape,
  ): string {
    if (title === null) {
      return intl.formatMessage({ defaultMessage: "New conversation" });
    }
    const segments = [
      ...new Intl.Segmenter(undefined, { granularity: "word" }).segment(title),
    ];
    return segments.length > DISPLAY_NAME_LENGTH
      ? `${segments
          .slice(0, DISPLAY_NAME_LENGTH)
          .map(({ segment }) => segment)
          .join("")}…`
      : title;
  },

  findToolResult(
    { messages }: Conversation,
    { id }: ToolCall,
  ): ToolResult | null {
    return (
      messages
        .filter((message) => "toolResults" in message)
        .flatMap(({ toolResults }) => toolResults)
        .find(({ toolCallId }) => toolCallId === id) ?? null
    );
  },

  findToolCall({ messages }: Conversation, toolResult: ToolResult): ToolCall {
    const toolCall = messages
      .filter((message) => "toolCalls" in message)
      .flatMap(({ toolCalls }) => toolCalls)
      .find(
        (toolCall) =>
          toolCall.id === toolResult.toolCallId &&
          toolCall.tool === toolResult.tool,
      );
    if (!toolCall) {
      throw new Error(
        `ToolResult ${toolResult.toolCallId} for tool ${toolResult.tool} does not have a corresponding ToolCall.`,
      );
    }
    return toolCall;
  },

  isSuccessfulCreateDocumentToolResult(
    toolResult: ToolResult,
  ): toolResult is ToolResult.CreateDocument & {
    output: { success: true };
  } {
    return (
      toolResult.tool === ToolName.CreateDocument && toolResult.output.success
    );
  },

  isSuccessfulCreateNewDocumentVersionToolResult(
    toolResult: ToolResult,
  ): toolResult is ToolResult.CreateNewDocumentVersion & {
    output: { success: true };
  } {
    return (
      toolResult.tool === ToolName.CreateNewDocumentVersion &&
      toolResult.output.success
    );
  },

  isSuccessfulGetCollectionTypescriptSchemaToolResult(
    toolResult: ToolResult,
  ): toolResult is ToolResult.GetCollectionTypescriptSchema & {
    output: { success: true };
  } {
    return (
      toolResult.tool === ToolName.GetCollectionTypescriptSchema &&
      toolResult.output.success
    );
  },

  isSuccessfulSuggestCollectionDefinitionToolResult(
    toolResult: ToolResult,
  ): toolResult is ToolResult.SuggestCollectionDefinition & {
    output: { success: true };
  } {
    return (
      toolResult.tool === ToolName.SuggestCollectionDefinition &&
      toolResult.output.success
    );
  },

  isSuccessfulRenderChartToolResult(
    toolResult: ToolResult,
  ): toolResult is ToolResult.RenderChart & {
    output: { success: true };
  } {
    return (
      toolResult.tool === ToolName.RenderChart && toolResult.output.success
    );
  },

  isCreateDocumentToolCall(
    toolCall: ToolCall,
  ): toolCall is ToolCall.CreateDocument {
    return toolCall.tool === ToolName.CreateDocument;
  },

  isCreateNewDocumentVersionToolCall(
    toolCall: ToolCall,
  ): toolCall is ToolCall.CreateNewDocumentVersion {
    return toolCall.tool === ToolName.CreateNewDocumentVersion;
  },

  isExecuteJavascriptFunctionToolCall(
    toolCall: ToolCall,
  ): toolCall is ToolCall.ExecuteJavascriptFunction {
    return toolCall.tool === ToolName.ExecuteJavascriptFunction;
  },

  isRenderChartToolCall(toolCall: ToolCall): toolCall is ToolCall.RenderChart {
    return toolCall.tool === ToolName.RenderChart;
  },

  isGetCollectionTypescriptSchemaToolCall(
    toolCall: ToolCall,
  ): toolCall is ToolCall.GetCollectionTypescriptSchema {
    return toolCall.tool === ToolName.GetCollectionTypescriptSchema;
  },
};
