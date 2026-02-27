import {
  type InferenceOptions,
  type Message,
  type MessageContentPart,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
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
  export type InputItem =
    | MessageItem
    | FunctionCallItem
    | FunctionCallOutputItem;

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
  }

  export type OutputItem = MessageOutputItem | ResponseFunctionCallItem;
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
}

export function toResponsesRequest(
  model: string,
  messages: Message[],
  tools: InferenceService.Tool[],
): Responses.Request {
  const responsesTools = tools.map(toResponsesTool);
  return {
    model: model,
    input: messages.flatMap(toResponsesInputItem),
    tools: responsesTools.length > 0 ? responsesTools : undefined,
    stream: false,
  };
}

function toResponsesInputItem(
  message: Message,
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
        .filter((p): p is Responses.InputContentPart => p !== null),
    };
  }

  if (message.role === MessageRole.Tool) {
    return message.toolResults.map((toolResult) => ({
      type: "function_call_output",
      call_id: toolResult.toolCallId,
      output: JSON.stringify(toolResult.output),
    }));
  }

  if ("toolCalls" in message) {
    return message.toolCalls.map((toolCall) => ({
      type: "function_call",
      call_id: toolCall.id,
      name: toolCall.tool,
      arguments: JSON.stringify(toolCall.input),
    }));
  }

  return {
    type: "message",
    role: "assistant",
    content: message.content
      .filter((part) => part.type === MessageContentPartType.Text)
      .map((part) => part.text)
      .join("\n"),
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

export function fromResponsesResponse(
  response: Responses.Response,
  inferenceOptions: InferenceOptions<"completion">,
): Message.ToolCallAssistant | Message.ContentAssistant {
  const baseMessage = {
    role: MessageRole.Assistant,
    inferenceOptions: inferenceOptions,
    createdAt: new Date(),
  } as const;

  const functionCalls = response.output.filter(
    (item): item is Responses.ResponseFunctionCallItem =>
      item.type === "function_call",
  );

  if (functionCalls.length > 0) {
    return {
      ...baseMessage,
      toolCalls: functionCalls.map((call) => ({
        id: call.call_id,
        tool: call.name,
        input: JSON.parse(call.arguments),
      })),
    };
  }

  const text =
    response.output
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
      .join("\n") ?? "";

  return {
    ...baseMessage,
    content: [{ type: MessageContentPartType.Text, text }],
  };
}

export function extractTextFromResponse(response: Responses.Response): string {
  return (
    response.output
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
      .join("\n") ?? ""
  );
}
