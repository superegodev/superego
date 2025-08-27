import {
  type Message,
  type MessageContentPart,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import type Groq from "groq-sdk";

export function toGroqTool(
  tool: InferenceService.Tool,
): Groq.Chat.ChatCompletionTool {
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema as any,
    },
  };
}

export function toGroqMessage(
  message: Message,
):
  | Groq.Chat.ChatCompletionMessageParam
  | Groq.Chat.ChatCompletionMessageParam[] {
  if (message.role === MessageRole.Tool) {
    return message.toolResults.map(
      (toolResult) =>
        ({
          role: "tool",
          content: JSON.stringify(toolResult.output),
          tool_call_id: toolResult.toolCallId,
        }) satisfies Groq.Chat.ChatCompletionToolMessageParam,
    );
  }
  if ("toolCalls" in message) {
    return {
      role: "assistant",
      tool_calls: message.toolCalls.map((toolCall) => ({
        id: toolCall.id,
        type: "function",
        function: {
          name: toolCall.tool,
          arguments: JSON.stringify(toolCall.input),
        },
      })),
    };
  }
  return {
    role: toGroqRole(message.role),
    content: message.content.map(toGroqContentPart),
  } as Groq.Chat.ChatCompletionMessageParam;
}

export function toGroqRole(
  role: MessageRole,
): "developer" | "user" | "assistant" | "tool" {
  switch (role) {
    case MessageRole.Developer:
      return "developer";
    case MessageRole.UserContext:
      return "user";
    case MessageRole.User:
      return "user";
    case MessageRole.Assistant:
      return "assistant";
    case MessageRole.Tool:
      return "tool";
  }
}

export function toGroqContentPart(
  contentPart: MessageContentPart,
): Groq.Chat.ChatCompletionContentPart {
  switch (contentPart.type) {
    case MessageContentPartType.Text:
      return { type: "text", text: contentPart.text };
  }
}

export function fromGroqAssistantMessage(
  message: Groq.Chat.ChatCompletionMessage,
): Message.Assistant {
  const baseMessage = {
    role: MessageRole.Assistant,
    createdAt: new Date(),
  } as const;
  if (message.tool_calls) {
    return {
      ...baseMessage,
      toolCalls: message.tool_calls.map((tool_call) => ({
        id: tool_call.id,
        tool: tool_call.function.name,
        // TODO: maybe we should leave parsing to upper layers
        input: JSON.parse(tool_call.function.arguments),
      })),
    };
  }
  return {
    ...baseMessage,
    content: [
      {
        type: MessageContentPartType.Text,
        text: message.content!,
      },
    ],
  };
}
