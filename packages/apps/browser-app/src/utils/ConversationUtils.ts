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

  isSuccessfulCreateDocumentsToolResult(
    toolResult: ToolResult,
  ): toolResult is ToolResult.CreateDocuments & {
    output: { success: true };
  } {
    return (
      toolResult.tool === ToolName.CreateDocuments && toolResult.output.success
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

  isSuccessfulSuggestCollectionsDefinitionsToolResult(
    toolResult: ToolResult,
  ): toolResult is ToolResult.SuggestCollectionsDefinitions & {
    output: { success: true };
  } {
    return (
      toolResult.tool === ToolName.SuggestCollectionsDefinitions &&
      toolResult.output.success
    );
  },

  isSuccessfulCreateChartToolResult(
    toolResult: ToolResult,
  ): toolResult is ToolResult.CreateChart & {
    output: { success: true };
  } {
    return (
      toolResult.tool === ToolName.CreateChart && toolResult.output.success
    );
  },

  isSuccessfulCreateDocumentsTablesToolResult(
    toolResult: ToolResult,
  ): toolResult is ToolResult.CreateDocumentsTables & {
    output: { success: true };
  } {
    return (
      toolResult.tool === ToolName.CreateDocumentsTables &&
      toolResult.output.success
    );
  },

  isCreateDocumentsToolCall(
    toolCall: ToolCall,
  ): toolCall is ToolCall.CreateDocuments {
    return toolCall.tool === ToolName.CreateDocuments;
  },

  isCreateNewDocumentVersionToolCall(
    toolCall: ToolCall,
  ): toolCall is ToolCall.CreateNewDocumentVersion {
    return toolCall.tool === ToolName.CreateNewDocumentVersion;
  },

  isExecuteTypescriptFunctionToolCall(
    toolCall: ToolCall,
  ): toolCall is ToolCall.ExecuteTypescriptFunction {
    return toolCall.tool === ToolName.ExecuteTypescriptFunction;
  },

  isCreateChartToolCall(toolCall: ToolCall): toolCall is ToolCall.CreateChart {
    return toolCall.tool === ToolName.CreateChart;
  },

  isCreateDocumentsTablesToolCall(
    toolCall: ToolCall,
  ): toolCall is ToolCall.CreateDocumentsTables {
    return toolCall.tool === ToolName.CreateDocumentsTables;
  },

  isGetCollectionTypescriptSchemaToolCall(
    toolCall: ToolCall,
  ): toolCall is ToolCall.GetCollectionTypescriptSchema {
    return toolCall.tool === ToolName.GetCollectionTypescriptSchema;
  },
};
