import {
  type Message,
  type MessageContentPart,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import JsonSchemaUtils from "../utils/JsonSchemaUtils.js";
import type Google from "./Google.js";

export default function toGoogleGenerateContentRequest(
  previousMessages: Message[],
  tools: InferenceService.Tool[],
): Google.GenerateContentRequest {
  return {
    systemInstruction: toGoogleSystemInstruction(previousMessages),
    contents: previousMessages.flatMap(toGoogleContent),
    tools: [{ functionDeclarations: tools.map(toGoogleFunctionDeclaration) }],
  };
}

function toGoogleSystemInstruction(
  messages: Message[],
): Google.GenerateContentRequest["systemInstruction"] {
  const developerMessage = messages.find(
    (message) => message.role === MessageRole.Developer,
  );
  return developerMessage
    ? { parts: [{ text: developerMessage.content[0].text }] }
    : undefined;
}

function toGoogleFunctionDeclaration(
  tool: InferenceService.FunctionTool,
): Google.FunctionDeclaration {
  return {
    name: tool.name,
    description: tool.description,
    parameters: JsonSchemaUtils.stripAdditionalProperties(
      tool.inputSchema,
    ) as any,
  };
}

function toGoogleContent(message: Message): Google.Content | Google.Content[] {
  if (message.role === MessageRole.Developer) {
    return [];
  }

  if (message.role === MessageRole.Tool) {
    return {
      role: "user",
      parts: message.toolResults
        // Th Google API doesn't support toolCallIds, and wants instead tool
        // results to be sent back in the same order in which tools calls
        // arrived. To guarantee we do this correctly, when tool calls arrive we
        // generate a progressive id for them. Then, here we sort tool results
        // according to that.
        .toSorted((a, b) =>
          Number.parseInt(a.toolCallId, 10) < Number.parseInt(b.toolCallId, 10)
            ? -1
            : 1,
        )
        .map((toolResult) => ({
          functionResponse: {
            name: toolResult.tool,
            response: toolResult.output,
          },
        })),
    };
  }

  if ("toolCalls" in message) {
    return {
      role: "model",
      parts: message.toolCalls.map((toolCall) => ({
        functionCall: {
          name: toolCall.tool,
          args: toolCall.input as any,
        },
      })),
    };
  }

  return {
    role: toGoogleRole(message.role),
    parts: message.content.map(toGoogleTextPart),
  };
}

function toGoogleRole(
  role: Exclude<MessageRole, MessageRole.Developer | MessageRole.Tool>,
): "user" | "model" {
  switch (role) {
    case MessageRole.User:
    case MessageRole.UserContext:
      return "user";
    case MessageRole.Assistant:
      return "model";
  }
}

function toGoogleTextPart(contentPart: MessageContentPart): Google.TextPart {
  switch (contentPart.type) {
    case MessageContentPartType.Text:
      return { text: contentPart.text };
  }
}
