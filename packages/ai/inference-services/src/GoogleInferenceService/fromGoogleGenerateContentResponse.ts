import {
  type Message,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import { isNonEmptyArray, mapNonEmptyArray } from "@superego/shared-utils";
import type Google from "./Google.js";

export default function fromGoogleGenerateContentResponse(
  response: Google.GenerateContentResponse,
):
  | Omit<Message.ToolCallAssistant, "agent">
  | Omit<Message.ContentAssistant, "agent"> {
  const now = new Date();
  const baseMessage = {
    role: MessageRole.Assistant,
    createdAt: now,
  } as const;

  const parts = response.candidates?.[0]?.content?.parts ?? [];

  const functionCalls = parts
    .filter((part) => "functionCall" in part)
    .map(({ functionCall }) => functionCall);

  if (functionCalls.length > 0) {
    return {
      ...baseMessage,
      toolCalls: functionCalls.map((functionCall, index) => ({
        id: String(now.getTime() + index),
        tool: functionCall.name,
        input: functionCall.args ?? {},
      })),
    } satisfies Omit<Message.ToolCallAssistant, "agent">;
  }

  const textParts = parts.filter((part) => "text" in part);

  if (!isNonEmptyArray(textParts)) {
    throw new Error(
      "The response contained neither tool calls nor content messages.",
    );
  }

  return {
    ...baseMessage,
    content: mapNonEmptyArray(textParts, ({ text }) => ({
      type: MessageContentPartType.Text,
      text: text,
    })),
  };
}
