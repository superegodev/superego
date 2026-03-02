import {
  type InferenceOptions,
  type Message,
  type MessageContentPart,
  MessageContentPartType,
  MessageRole,
  type ReasoningEffort,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import { Id } from "@superego/shared-utils";
import { compact } from "es-toolkit";
import getAudioFormat from "../utils/getAudioFormat.js";
import toBase64 from "../utils/toBase64.js";
import toDataURL from "../utils/toDataURL.js";

export namespace Responses {
  ///////////////////
  // Request types //
  ///////////////////

  export type Request = {
    input: InputItem[];
    model: string;
    tools: Tool[] | undefined;
    reasoning: { effort: string; summary: "auto" } | undefined;
    stream: boolean;
  };

  export interface MessageItem {
    type: "message";
    role: "system" | "user" | "assistant";
    content: string | InputContentPart[];
  }
  export interface FunctionCallItem {
    type: "function_call";
    call_id: string;
    name: string;
    arguments: string;
  }
  export interface FunctionCallOutputItem {
    type: "function_call_output";
    call_id: string;
    output: string;
  }
  export interface ReasoningInputItem {
    type: "reasoning";
    id?: string;
    content?: { type: "reasoning_text"; text: string }[];
    encrypted_content?: string;
    summary?: { type: "summary_text"; text: string }[];
    signature?: string;
    format?: string;
  }
  export type InputItem =
    | MessageItem
    | FunctionCallItem
    | FunctionCallOutputItem
    | ReasoningInputItem;

  export interface InputTextPart {
    type: "input_text";
    text: string;
  }
  export interface InputImagePart {
    type: "input_image";
    image_url: string;
  }
  export interface InputFilePart {
    type: "input_file";
    filename: string;
    file_data: string;
  }
  export interface InputAudioPart {
    type: "input_audio";
    input_audio: {
      data: string;
      format: string;
    };
  }
  export type InputContentPart =
    | InputTextPart
    | InputImagePart
    | InputFilePart
    | InputAudioPart;

  export interface Tool {
    type: "function";
    name: string;
    description: string;
    parameters: object;
  }

  ////////////////////
  // Response types //
  ////////////////////

  export interface Response {
    id: string;
    output: OutputItem[];
    usage: {
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
      cost?: number;
    };
  }

  export type OutputItem =
    | MessageOutputItem
    | ResponseFunctionCallItem
    | ReasoningOutputItem;
  export interface MessageOutputItem {
    type: "message";
    role: "assistant";
    content: OutputContentPart[];
  }
  export interface ResponseFunctionCallItem {
    type: "function_call";
    id: string;
    call_id: string;
    name: string;
    arguments: string;
  }

  export interface OutputTextPart {
    type: "output_text";
    text: string;
  }
  export type OutputContentPart = OutputTextPart;

  export interface ReasoningOutputItem {
    type: "reasoning";
    id: string;
    content?: { type: "reasoning_text"; text: string }[];
    encrypted_content?: string;
    summary?: { type: "summary_text"; text: string }[];
    signature?: string;
  }
}

export function toResponsesRequest(
  model: string,
  messages: Message[],
  tools: InferenceService.Tool[],
  reasoningEffort: ReasoningEffort | null,
): Responses.Request {
  const responsesTools = tools.map(toResponsesTool);
  const latestTurnStartIndex = findLatestTurnStartIndex(messages);
  return {
    model: model,
    input: messages.flatMap((message, index) =>
      toResponsesInputItem(
        message,
        reasoningEffort !== null && index >= latestTurnStartIndex,
      ),
    ),
    tools: responsesTools.length > 0 ? responsesTools : undefined,
    reasoning: reasoningEffort
      ? { effort: reasoningEffort, summary: "auto" }
      : undefined,
    stream: false,
  };
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

function toResponsesInputItem(
  message: Message,
  includeReasoning: boolean,
): Responses.InputItem | Responses.InputItem[] {
  if (message.role === MessageRole.Developer) {
    return {
      type: "message",
      role: "system",
      content: message.content[0].text,
    };
  }

  if (
    message.role === MessageRole.User ||
    message.role === MessageRole.UserContext
  ) {
    return {
      type: "message",
      role: "user",
      content: (message.content as MessageContentPart[])
        .map(toResponsesInputContentPart)
        .filter((part): part is Responses.InputContentPart => part !== null),
    };
  }

  if (message.role === MessageRole.Tool) {
    return message.toolResults.map((toolResult) => ({
      type: "function_call_output",
      call_id: toolResult.toolCallId,
      output: JSON.stringify(toolResult.output),
    }));
  }

  const reasoningItem = includeReasoning
    ? toReasoningInputItem(message.reasoning)
    : null;

  if ("toolCalls" in message) {
    return compact([
      reasoningItem,
      ...message.toolCalls.map((toolCall) => ({
        type: "function_call" as const,
        call_id: toolCall.id,
        name: toolCall.tool,
        arguments: JSON.stringify(toolCall.input),
      })),
    ]);
  }

  return compact([
    reasoningItem,
    {
      type: "message",
      role: "assistant",
      content: message.content
        .filter((part) => part.type === MessageContentPartType.Text)
        .map((part) => part.text)
        .join("\n"),
    },
  ]);
}

function toReasoningInputItem(
  reasoning: Message.Assistant.Reasoning,
): Responses.ReasoningInputItem | null {
  if (
    !reasoning.content &&
    !reasoning.encryptedContent &&
    !reasoning.contentSignature &&
    !reasoning.summary
  ) {
    return null;
  }
  return {
    type: "reasoning",
    ...(reasoning.content !== undefined
      ? {
          content: [{ type: "reasoning_text", text: reasoning.content }],
        }
      : null),
    ...(reasoning.encryptedContent !== undefined
      ? { encrypted_content: reasoning.encryptedContent }
      : null),
    ...(reasoning.contentSignature !== undefined
      ? { signature: reasoning.contentSignature }
      : null),
    ...(reasoning.summary !== undefined
      ? {
          summary: [{ type: "summary_text", text: reasoning.summary }],
        }
      : null),
  };
}

function toResponsesInputContentPart(
  part: MessageContentPart,
): Responses.InputContentPart | null {
  switch (part.type) {
    case MessageContentPartType.Text:
      return { type: "input_text", text: part.text };
    case MessageContentPartType.Audio:
      return {
        type: "input_audio",
        input_audio: {
          data: toBase64(part.audio.content),
          format: getAudioFormat(part.audio.contentType),
        },
      };
    case MessageContentPartType.File: {
      if (!("content" in part.file)) {
        return null;
      }
      const fileDataUrl = toDataURL(part.file.content, part.file.mimeType);
      if (part.file.mimeType.startsWith("image/")) {
        return { type: "input_image", image_url: fileDataUrl };
      }
      return {
        type: "input_file",
        filename: part.file.name,
        file_data: fileDataUrl,
      };
    }
  }
}

function toResponsesTool(tool: InferenceService.Tool): Responses.Tool {
  return {
    type: "function",
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema as any,
  };
}

function extractReasoning(
  output: Responses.OutputItem[],
): Message.Assistant.Reasoning {
  const reasoningItem = output.find((item) => item.type === "reasoning");
  if (!reasoningItem) {
    return {};
  }
  const reasoning: Message.Assistant.Reasoning = {};
  if (reasoningItem.content && reasoningItem.content.length > 0) {
    reasoning.content = reasoningItem.content
      .map((part) => part.text)
      .join("\n");
  }
  if (reasoningItem.encrypted_content !== undefined) {
    reasoning.encryptedContent = reasoningItem.encrypted_content;
  }
  if (reasoningItem.signature !== undefined) {
    reasoning.contentSignature = reasoningItem.signature;
  }
  if (reasoningItem.summary && reasoningItem.summary.length > 0) {
    reasoning.summary = reasoningItem.summary
      .map((part) => part.text)
      .join("\n");
  }
  return reasoning;
}

export function fromResponsesResponse(
  response: Responses.Response,
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
      totalTokens: response.usage.total_tokens,
      cost: response.usage.cost,
    },
    createdAt: new Date(),
  } as const;

  const reasoning = extractReasoning(response.output);

  const functionCalls = response.output.filter(
    (item): item is Responses.ResponseFunctionCallItem =>
      item.type === "function_call",
  );

  if (functionCalls.length > 0) {
    return {
      ...baseMessage,
      reasoning,
      toolCalls: functionCalls.map((call) => ({
        id: call.call_id,
        tool: call.name,
        input: JSON.parse(call.arguments),
      })),
    };
  }

  const text = response.output
    .filter(
      (item): item is Responses.MessageOutputItem => item.type === "message",
    )
    .flatMap((item) =>
      item.content
        .filter(
          (part): part is Responses.OutputTextPart =>
            part.type === "output_text",
        )
        .map((part) => part.text),
    )
    .join("\n");

  return {
    ...baseMessage,
    reasoning,
    content: [{ type: MessageContentPartType.Text, text }],
  };
}

export function extractTextFromResponse(response: Responses.Response): string {
  return response.output
    .filter(
      (item): item is Responses.MessageOutputItem => item.type === "message",
    )
    .flatMap((item) =>
      item.content
        .filter(
          (part): part is Responses.OutputTextPart =>
            part.type === "output_text",
        )
        .map((part) => part.text),
    )
    .join("\n");
}
