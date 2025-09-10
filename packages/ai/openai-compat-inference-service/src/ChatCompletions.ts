import {
  type Message,
  type MessageContentPart,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";

export namespace ChatCompletions {
  export type Message =
    | { role: "system"; content: string }
    | { role: "user"; content: ContentPart[] }
    | { role: "tool"; content: string; tool_call_id: string }
    | { role: "assistant"; content: string; tool_calls?: undefined | [] }
    | { role: "assistant"; content: null | ""; tool_calls: ToolCall[] };

  export interface TextPart {
    type: "text";
    text: string;
  }
  export type ContentPart = TextPart;

  export interface ToolCall {
    id: string;
    type: "function";
    function: FunctionCall;
  }

  export interface FunctionCall {
    name: string;
    arguments: string;
  }

  ///////////////////
  // Request types //
  ///////////////////

  export type Request = {
    messages: Message[];
    model: string;
    tools: Tool[] | undefined;
    stream: boolean;
  };

  export interface Tool {
    type: "function";
    function: FunctionDescription;
  }

  export interface FunctionDescription {
    description: string;
    name: string;
    /** JSON schema object. */
    parameters: object;
  }

  ////////////////////
  // Response types //
  ////////////////////

  export interface Response {
    choices: [Choice];
  }

  export interface Choice {
    message: Message & { role: "assistant" };
  }
}

export function toChatCompletionsRequest(
  model: string,
  messages: Message[],
  tools: InferenceService.Tool[],
): ChatCompletions.Request {
  const chatCompletionTools = tools.map(toChatCompletionsTool);
  return {
    model: model,
    messages: messages.flatMap(toChatCompletionsMessage),
    tools: chatCompletionTools.length > 0 ? chatCompletionTools : undefined,
    stream: false,
  };
}

function toChatCompletionsMessage(
  message: Message,
): ChatCompletions.Message | ChatCompletions.Message[] {
  if (message.role === MessageRole.Developer) {
    return { role: "system", content: message.content[0].text };
  }
  if (
    message.role === MessageRole.User ||
    message.role === MessageRole.UserContext
  ) {
    return {
      role: "user",
      content: (message.content as MessageContentPart[])
        .filter((part) => part.type === MessageContentPartType.Text)
        .map((part) => ({
          type: "text",
          text: part.text,
        })),
    };
  }
  if (message.role === MessageRole.Tool) {
    return message.toolResults.map((toolResult) => ({
      role: "tool",
      content: JSON.stringify(toolResult.output),
      tool_call_id: toolResult.toolCallId,
    }));
  }
  if ("toolCalls" in message) {
    return {
      role: "assistant",
      content: null,
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
    role: "assistant",
    content: message.content
      .filter((part) => part.type === MessageContentPartType.Text)
      .map((part) => part.text)
      .join("\n"),
  };
}

function toChatCompletionsTool(
  tool: InferenceService.Tool,
): ChatCompletions.Tool {
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema as any,
    },
  };
}

export function fromChatCompletionsResponse(
  response: ChatCompletions.Response,
): Message.ToolCallAssistant | Message.ContentAssistant {
  const { message } = response.choices[0];
  const baseMessage = {
    role: MessageRole.Assistant,
    createdAt: new Date(),
  } as const;
  if (isChatCompletionsAssistantToolMessage(message)) {
    console.log(message.tool_calls);
    return {
      ...baseMessage,
      toolCalls: message.tool_calls.map((tool_call) => ({
        id: tool_call.id,
        tool: tool_call.function.name,
        input: JSON.parse(tool_call.function.arguments),
      })),
    };
  }
  return {
    ...baseMessage,
    content: [{ type: MessageContentPartType.Text, text: message.content }],
  };
}

function isChatCompletionsAssistantToolMessage(
  message: ChatCompletions.Message & { role: "assistant" },
): message is ChatCompletions.Message & {
  role: "assistant";
  tool_calls: ChatCompletions.ToolCall[];
} {
  return !!message.tool_calls && message.tool_calls.length > 0;
}
