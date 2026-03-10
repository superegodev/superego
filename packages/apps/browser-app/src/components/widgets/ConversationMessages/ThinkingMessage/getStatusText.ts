import { type Conversation, MessageRole, ToolName } from "@superego/backend";
import type { IntlShape } from "react-intl";

export default function getStatusText(
  intl: IntlShape,
  conversation: Conversation,
): string {
  const lastMessage = conversation.messages.at(-1);

  let tools: string[] = [];
  if (
    lastMessage?.role === MessageRole.Assistant &&
    "toolCalls" in lastMessage
  ) {
    tools = lastMessage.toolCalls.map((tc) => tc.tool);
  } else if (lastMessage?.role === MessageRole.Tool) {
    tools = lastMessage.toolResults.map((tr) => tr.tool);
  }

  if (tools.length > 0) {
    const toolCounts = countToolCallsSinceLastUserMessage(conversation);
    const messages = [
      ...new Set(
        tools.map((tool) =>
          getToolMessage(intl, tool, toolCounts.get(tool) ?? 1),
        ),
      ),
    ];
    const joined = intl.formatList(messages, { type: "conjunction" });
    return capitalize(joined);
  }

  const thinkingVariants = [
    intl.formatMessage({ defaultMessage: "Cogitating" }),
    intl.formatMessage({ defaultMessage: "Ruminating" }),
    intl.formatMessage({ defaultMessage: "Pondering" }),
  ];
  // Pick a variant deterministically from the last message id (falling back to
  // conversation id) so it's stable across re-renders but different across
  // turns.
  const hashSource =
    lastMessage && "id" in lastMessage ? lastMessage.id : conversation.id;
  const hash = Array.from(hashSource).reduce(
    (acc: number, char: string) => acc + char.charCodeAt(0),
    0,
  );
  return thinkingVariants[hash % thinkingVariants.length]!;
}

function countToolCallsSinceLastUserMessage(
  conversation: Conversation,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (let i = conversation.messages.length - 1; i >= 0; i--) {
    const message = conversation.messages[i]!;
    if (message.role === MessageRole.User) {
      break;
    }
    if (message.role === MessageRole.Assistant && "toolCalls" in message) {
      for (const toolCall of message.toolCalls) {
        counts.set(toolCall.tool, (counts.get(toolCall.tool) ?? 0) + 1);
      }
    }
  }
  return counts;
}

type ToolMessageVariants = [string, string, string];

function getToolMessage(
  intl: IntlShape,
  tool: string,
  occurrence: number,
): string {
  const variants = getToolMessageVariants(intl, tool);
  const index = Math.min(occurrence - 1, 2) as 0 | 1 | 2;
  return variants[index];
}

function getToolMessageVariants(
  intl: IntlShape,
  tool: string,
): ToolMessageVariants {
  switch (tool) {
    case ToolName.SearchDocuments:
      return [
        intl.formatMessage({ defaultMessage: "searching through documents" }),
        intl.formatMessage({
          defaultMessage: "searching through other documents",
        }),
        intl.formatMessage({
          defaultMessage: "searching through more documents",
        }),
      ];
    case ToolName.CreateDocuments:
      return [
        intl.formatMessage({ defaultMessage: "creating new documents" }),
        intl.formatMessage({
          defaultMessage: "creating other documents",
        }),
        intl.formatMessage({
          defaultMessage: "creating more documents",
        }),
      ];
    case ToolName.CreateNewDocumentVersion:
      return [
        intl.formatMessage({
          defaultMessage: "updating existing documents",
        }),
        intl.formatMessage({
          defaultMessage: "updating other documents",
        }),
        intl.formatMessage({
          defaultMessage: "updating more documents",
        }),
      ];
    case ToolName.ExecuteTypescriptFunction:
      return [
        intl.formatMessage({
          defaultMessage: "running code to analyze documents",
        }),
        intl.formatMessage({ defaultMessage: "running more code" }),
        intl.formatMessage({ defaultMessage: "still running code" }),
      ];
    case ToolName.GetCollectionTypescriptSchema:
      return [
        intl.formatMessage({
          defaultMessage: "reading collection schemas",
        }),
        intl.formatMessage({
          defaultMessage: "reading other collection schemas",
        }),
        intl.formatMessage({
          defaultMessage: "reading more collection schemas",
        }),
      ];
    case ToolName.CreateChart:
      return [
        intl.formatMessage({
          defaultMessage: "creating charts to use in response",
        }),
        intl.formatMessage({
          defaultMessage: "creating other charts",
        }),
        intl.formatMessage({
          defaultMessage: "creating more charts",
        }),
      ];
    case ToolName.CreateGeoJSONMap:
      return [
        intl.formatMessage({
          defaultMessage: "creating maps to use in response",
        }),
        intl.formatMessage({ defaultMessage: "creating other maps" }),
        intl.formatMessage({ defaultMessage: "creating more maps" }),
      ];
    case ToolName.CreateDocumentsTables:
      return [
        intl.formatMessage({
          defaultMessage: "creating tables to use in response",
        }),
        intl.formatMessage({
          defaultMessage: "creating other tables",
        }),
        intl.formatMessage({
          defaultMessage: "creating more tables",
        }),
      ];
    case ToolName.SuggestCollectionsDefinitions:
      return [
        intl.formatMessage({
          defaultMessage: "suggesting new collections",
        }),
        intl.formatMessage({
          defaultMessage: "suggesting other collections",
        }),
        intl.formatMessage({
          defaultMessage: "suggesting more collections",
        }),
      ];
    case ToolName.InspectFile:
      return [
        intl.formatMessage({
          defaultMessage: "inspecting the provided files",
        }),
        intl.formatMessage({
          defaultMessage: "inspecting other files",
        }),
        intl.formatMessage({
          defaultMessage: "inspecting more files",
        }),
      ];
    default:
      return [
        intl.formatMessage({ defaultMessage: "running tools" }),
        intl.formatMessage({ defaultMessage: "running other tools" }),
        intl.formatMessage({ defaultMessage: "running more tools" }),
      ];
  }
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
