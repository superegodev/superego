import {
  type Message,
  type MessageContentPart,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import { isNonEmptyArray, mapNonEmptyArray } from "@superego/shared-utils";
import type OpenAI from "openai";

export function toOpenaiTool(
  tool: InferenceService.Tool,
): OpenAI.Responses.FunctionTool {
  return {
    type: "function",
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema as any,
    strict: false,
  };
}

export function toOpenaiInputItem(
  message: Message,
): OpenAI.Responses.ResponseInputItem | OpenAI.Responses.ResponseInputItem[] {
  if (message.role === MessageRole.Tool) {
    return message.toolResults.map((toolResult) => ({
      type: "function_call_output",
      call_id: toolResult.toolCallId,
      output: JSON.stringify(toolResult.output),
    })) satisfies OpenAI.Responses.ResponseInputItem.FunctionCallOutput[];
  }
  if ("toolCalls" in message) {
    return message.toolCalls.map((toolCall) => ({
      call_id: toolCall.id,
      type: "function_call",
      name: toolCall.tool,
      arguments: JSON.stringify(toolCall.input),
    })) satisfies OpenAI.Responses.ResponseFunctionToolCall[];
  }
  return {
    role: toOpenaiRole(message.role),
    content: message.content.map((contentPart) =>
      toOpenaiContentPart(contentPart, message.role),
    ),
  } as OpenAI.Responses.ResponseInputItem;
}

export function toOpenaiRole(
  role: Exclude<MessageRole, MessageRole.Tool>,
): "developer" | "user" | "assistant" {
  switch (role) {
    case MessageRole.Developer:
      return "developer";
    case MessageRole.UserContext:
    case MessageRole.User:
      return "user";
    case MessageRole.Assistant:
      return "assistant";
  }
}

export function toOpenaiContentPart(
  contentPart: MessageContentPart,
  messageRole: MessageRole,
): OpenAI.Responses.ResponseOutputText | OpenAI.Responses.ResponseInputText {
  switch (contentPart.type) {
    case MessageContentPartType.Text:
      return messageRole === MessageRole.Assistant
        ? { type: "output_text", text: contentPart.text, annotations: [] }
        : { type: "input_text", text: contentPart.text };
  }
}

export function fromOpenaiOutputItems(
  outputItems: OpenAI.Responses.ResponseOutputItem[],
):
  | Omit<Message.ToolCallAssistant, "agent">
  | Omit<Message.ContentAssistant, "agent"> {
  const baseMessage = {
    role: MessageRole.Assistant,
    createdAt: new Date(),
  } as const;
  if (outputItems.some((item) => item.type === "function_call")) {
    return {
      ...baseMessage,
      toolCalls: outputItems
        .filter((item) => item.type === "function_call")
        .map((item) => ({
          id: item.call_id,
          tool: item.name,
          // TODO: maybe we should leave parsing to upper layers
          input: JSON.parse(item.arguments),
        })),
    };
  }
  const firstMessageItem = outputItems.find((item) => item.type === "message");
  if (!firstMessageItem) {
    throw new Error(
      "The response contained neither tool calls nor content messages.",
    );
  }
  const { content } = firstMessageItem;
  if (!isNonEmptyArray(content)) {
    throw new Error(
      "The response contained a content message with no content.",
    );
  }
  return {
    ...baseMessage,
    content: mapNonEmptyArray(content, (contentItem) => ({
      type: MessageContentPartType.Text,
      text:
        contentItem.type === "output_text"
          ? contentItem.text
          : contentItem.refusal,
    })),
  };
}
