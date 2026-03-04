import {
  type InferenceOptions,
  type Message,
  type MessageContentPart,
  MessageContentPartType,
  MessageRole,
  ReasoningEffort,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import { Id } from "@superego/shared-utils";
import { compact } from "es-toolkit";
import toBase64 from "../utils/toBase64.js";

export namespace AnthropicMessages {
  ///////////////////
  // Request types //
  ///////////////////

  export type Request = {
    model: string;
    max_tokens: number;
    system: SystemBlock[] | undefined;
    messages: RequestMessage[];
    tools: Tool[] | undefined;
    thinking: ThinkingConfig | undefined;
    stream: boolean;
  };

  export interface SystemBlock {
    type: "text";
    text: string;
  }

  export interface RequestMessage {
    role: "user" | "assistant";
    content: ContentBlock[];
  }

  export interface TextBlock {
    type: "text";
    text: string;
  }
  export interface ImageBlock {
    type: "image";
    source: {
      type: "base64";
      media_type: string;
      data: string;
    };
  }
  export interface DocumentBlock {
    type: "document";
    source: {
      type: "base64";
      media_type: string;
      data: string;
    };
  }
  export interface ToolUseBlock {
    type: "tool_use";
    id: string;
    name: string;
    input: object;
  }
  export interface ToolResultBlock {
    type: "tool_result";
    tool_use_id: string;
    content: string;
  }
  export interface ThinkingBlock {
    type: "thinking";
    thinking: string;
    signature: string;
  }
  export interface RedactedThinkingBlock {
    type: "redacted_thinking";
    data: string;
  }

  export type ContentBlock =
    | TextBlock
    | ImageBlock
    | DocumentBlock
    | ToolUseBlock
    | ToolResultBlock
    | ThinkingBlock
    | RedactedThinkingBlock;

  export interface Tool {
    name: string;
    description: string;
    input_schema: object;
  }

  export type ThinkingConfig =
    | { type: "enabled"; budget_tokens: number }
    | { type: "disabled" };

  ////////////////////
  // Response types //
  ////////////////////

  export interface Response {
    id: string;
    type: "message";
    role: "assistant";
    content: ResponseContentBlock[];
    stop_reason: string;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  }

  export type ResponseContentBlock =
    | TextBlock
    | ToolUseBlock
    | ThinkingBlock
    | RedactedThinkingBlock;
}

const BASE_MAX_TOKENS = 16384;

const THINKING_BUDGET_MAP: Record<string, number> = {
  [ReasoningEffort.Low]: 1024,
  [ReasoningEffort.Medium]: 4096,
  [ReasoningEffort.High]: 10000,
  [ReasoningEffort.XHigh]: 32000,
};

export function toAnthropicMessagesRequest(
  model: string,
  messages: Message[],
  tools: InferenceService.Tool[],
  reasoningEffort: ReasoningEffort | null,
): AnthropicMessages.Request {
  const systemBlocks = extractSystemBlocks(messages);
  const latestTurnStartIndex = findLatestTurnStartIndex(messages);
  const thinkingConfig = toThinkingConfig(reasoningEffort);

  const rawMessages = messages.flatMap((message, index) => {
    if (message.role === MessageRole.Developer) {
      return [];
    }
    return [
      toRequestMessage(
        message,
        reasoningEffort !== null && index >= latestTurnStartIndex,
      ),
    ];
  });

  const mergedMessages = mergeConsecutiveSameRoleMessages(rawMessages);
  const anthropicTools = tools.map(toAnthropicTool);

  const budgetTokens =
    thinkingConfig && thinkingConfig.type === "enabled"
      ? thinkingConfig.budget_tokens
      : 0;

  return {
    model,
    max_tokens: BASE_MAX_TOKENS + budgetTokens,
    system: systemBlocks.length > 0 ? systemBlocks : undefined,
    messages: mergedMessages,
    tools: anthropicTools.length > 0 ? anthropicTools : undefined,
    thinking: thinkingConfig,
    stream: false,
  };
}

function extractSystemBlocks(
  messages: Message[],
): AnthropicMessages.SystemBlock[] {
  return messages
    .filter((message) => message.role === MessageRole.Developer)
    .map((message) => ({ type: "text", text: message.content[0].text }));
}

function findLatestTurnStartIndex(messages: Message[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message && message.role === MessageRole.User) {
      return i + 1;
    }
  }
  return 0;
}

function toRequestMessage(
  message: Message,
  includeReasoning: boolean,
): AnthropicMessages.RequestMessage {
  if (
    message.role === MessageRole.User ||
    message.role === MessageRole.UserContext
  ) {
    return {
      role: "user",
      content: (message.content as MessageContentPart[])
        .map(toContentBlock)
        .filter((block): block is AnthropicMessages.ContentBlock => !!block),
    };
  }

  if (message.role === MessageRole.Tool) {
    return {
      role: "user",
      content: message.toolResults.map((toolResult) => ({
        type: "tool_result" as const,
        tool_use_id: toolResult.toolCallId,
        content: JSON.stringify(toolResult.output),
      })),
    };
  }

  if (message.role !== MessageRole.Assistant) {
    throw new Error(`Unexpected message role: "${message.role}"`);
  }

  const thinkingBlocks = includeReasoning
    ? toThinkingBlocks(message.reasoning)
    : [];

  if ("toolCalls" in message) {
    return {
      role: "assistant",
      content: [
        ...thinkingBlocks,
        ...message.toolCalls.map(
          (toolCall) =>
            ({
              type: "tool_use" as const,
              id: toolCall.id,
              name: toolCall.tool,
              input: toolCall.input,
            }) as AnthropicMessages.ToolUseBlock,
        ),
      ],
    };
  }

  return {
    role: "assistant",
    content: compact([
      ...thinkingBlocks,
      {
        type: "text" as const,
        text: message.content
          .filter((part) => part.type === MessageContentPartType.Text)
          .map((part) => part.text)
          .join("\n"),
      },
    ]),
  };
}

function toThinkingBlocks(
  reasoning: Message.Assistant.Reasoning,
): Array<
  AnthropicMessages.ThinkingBlock | AnthropicMessages.RedactedThinkingBlock
> {
  const blocks: Array<
    AnthropicMessages.ThinkingBlock | AnthropicMessages.RedactedThinkingBlock
  > = [];
  if (reasoning.content && reasoning.contentSignature) {
    blocks.push({
      type: "thinking",
      thinking: reasoning.content,
      signature: reasoning.contentSignature,
    });
  }
  if (reasoning.encryptedContent) {
    blocks.push({
      type: "redacted_thinking",
      data: reasoning.encryptedContent,
    });
  }
  return blocks;
}

function toContentBlock(
  part: MessageContentPart,
): AnthropicMessages.ContentBlock | null {
  switch (part.type) {
    case MessageContentPartType.Text:
      return { type: "text", text: part.text };
    case MessageContentPartType.Audio:
      throw new Error(
        "Audio content is not supported by the Anthropic Messages driver.",
      );
    case MessageContentPartType.File: {
      if (!("content" in part.file)) {
        return null;
      }
      const data = toBase64(part.file.content);
      if (part.file.mimeType.startsWith("image/")) {
        return {
          type: "image",
          source: { type: "base64", media_type: part.file.mimeType, data },
        };
      }
      return {
        type: "document",
        source: { type: "base64", media_type: part.file.mimeType, data },
      };
    }
  }
}

function toAnthropicTool(tool: InferenceService.Tool): AnthropicMessages.Tool {
  return {
    name: tool.name,
    description: tool.description,
    input_schema: tool.inputSchema as any,
  };
}

function toThinkingConfig(
  effort: ReasoningEffort | null,
): AnthropicMessages.ThinkingConfig | undefined {
  if (effort === null || effort === ReasoningEffort.None) {
    return undefined;
  }
  const budgetTokens = THINKING_BUDGET_MAP[effort];
  if (budgetTokens === undefined) {
    return undefined;
  }
  return { type: "enabled", budget_tokens: budgetTokens };
}

function mergeConsecutiveSameRoleMessages(
  messages: AnthropicMessages.RequestMessage[],
): AnthropicMessages.RequestMessage[] {
  const merged: AnthropicMessages.RequestMessage[] = [];
  for (const message of messages) {
    const last = merged[merged.length - 1];
    if (last && last.role === message.role) {
      last.content = [...last.content, ...message.content];
    } else {
      merged.push({ role: message.role, content: [...message.content] });
    }
  }
  return merged;
}

function extractReasoning(
  content: AnthropicMessages.ResponseContentBlock[],
): Message.Assistant.Reasoning {
  const reasoning: Message.Assistant.Reasoning = {};

  const thinkingBlocks = content.filter((block) => block.type === "thinking");
  if (thinkingBlocks.length > 0) {
    reasoning.content = thinkingBlocks
      .map((block) => block.thinking)
      .join("\n");
    reasoning.contentSignature =
      thinkingBlocks[thinkingBlocks.length - 1]!.signature;
  }

  const redactedThinkingBlocks = content.filter(
    (block) => block.type === "redacted_thinking",
  );
  if (redactedThinkingBlocks.length > 0) {
    reasoning.encryptedContent = redactedThinkingBlocks
      .map((block) => block.data)
      .join("\n");
  }

  return reasoning;
}

export function fromAnthropicMessagesResponse(
  response: AnthropicMessages.Response,
  inferenceOptions: InferenceOptions<"completion">,
  timeTaken: number,
): Message.ToolCallAssistant | Message.ContentAssistant {
  const baseMessage = {
    id: Id.generate.message(),
    role: MessageRole.Assistant,
    inferenceOptions: inferenceOptions,
    generationStats: {
      timeTaken,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      totalTokens: response.usage.input_tokens + response.usage.output_tokens,
    },
    createdAt: new Date(),
  } as const;

  const reasoning = extractReasoning(response.content);

  const toolUseBlocks = response.content.filter(
    (block) => block.type === "tool_use",
  );

  if (toolUseBlocks.length > 0) {
    return {
      ...baseMessage,
      reasoning,
      toolCalls: toolUseBlocks.map((block) => ({
        id: block.id,
        tool: block.name,
        input: block.input,
      })),
    };
  }

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return {
    ...baseMessage,
    reasoning,
    content: [{ type: MessageContentPartType.Text, text }],
  };
}

export function extractTextFromResponse(
  response: AnthropicMessages.Response,
): string {
  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}
