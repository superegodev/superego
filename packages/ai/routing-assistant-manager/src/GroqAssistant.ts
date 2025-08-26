import {
  type CompletionModel,
  type ConversationType,
  MessageRole,
} from "@superego/backend";
import { Assistant, type CollectionEntity } from "@superego/executing-backend";
import Groq from "groq-sdk";

export default class GroqAssistant implements Assistant {
  private groq: Groq;
  constructor(
    private model: CompletionModel,
    apiKey: string,
    baseUrl: string | null,
  ) {
    this.groq = new Groq({
      apiKey: apiKey,
      baseURL: baseUrl,
      dangerouslyAllowBrowser: true,
    });
  }

  async generateNextMessage(
    _conversationType: ConversationType,
    previousMessages: Assistant.Message[],
    _collections: CollectionEntity[],
  ): Promise<Assistant.GetNextMessageResult> {
    try {
      const response = await this.groq.chat.completions.create({
        model: this.model.slice("Groq_".length),
        messages: previousMessages.map(toGroqMessage) as any,
        stream: false,
      });
      return { success: true, message: fromGroqChoice(response.choices[0]!) };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

function toGroqMessage(
  message: Assistant.Message,
): Groq.Chat.ChatCompletionMessageParam {
  return {
    role: message.role.toLowerCase() as "user" | "assistant",
    content: message.parts.map((part) =>
      part.type === Assistant.MessagePartType.Text
        ? {
            text: part.content,
            type: message.role === MessageRole.User ? "text" : "text",
          }
        : {
            text: "TODO",
            type: "text",
          },
    ),
  };
}

function fromGroqChoice(
  choice: Groq.Chat.Completions.ChatCompletion.Choice,
): Assistant.Message {
  const textPart: Assistant.Text | null = choice.message.content
    ? {
        type: Assistant.MessagePartType.Text,
        content: choice.message.content,
        contentType: "text/markdown",
      }
    : null;
  return {
    role: MessageRole.Assistant,
    parts: [textPart].filter((part) => part !== null),
  };
}
