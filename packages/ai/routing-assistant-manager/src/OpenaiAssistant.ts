import {
  type CompletionModel,
  type ConversationType,
  MessageRole,
} from "@superego/backend";
import { Assistant, type CollectionEntity } from "@superego/executing-backend";
import OpenAI from "openai";

export default class OpenaiAssistant implements Assistant {
  private openai: OpenAI;
  constructor(
    private model: CompletionModel,
    apiKey: string,
    baseUrl: string | null,
  ) {
    this.openai = new OpenAI({
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
      const response = await this.openai.responses.create({
        // model: "o4-mini",
        model: this.model.slice("Openai_".length),
        input: previousMessages.map(toResponseInput) as any,
        store: false,
      });
      console.log(response);
      return {
        success: true,
        message: {
          role: MessageRole.Assistant,
          parts: response.output
            .filter((outputPart) => outputPart.type === "message")
            .map((outputPart) => ({
              type: Assistant.MessagePartType.Text,
              content: outputPart.content
                .filter((contentPart) => contentPart.type === "output_text")
                .map((contentPart) => contentPart.text)
                .join("\n"),
              contentType: "text/markdown",
            })),
        },
      };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }
}

function toResponseInput(message: Assistant.Message) {
  return {
    role: message.role.toLowerCase() as "user" | "assistant",
    content: message.parts.map((part) =>
      part.type === Assistant.MessagePartType.Text
        ? {
            text: part.content,
            type:
              message.role === MessageRole.User ? "input_text" : "output_text",
          }
        : {
            text: "TODO",
            type: "input_text",
          },
    ),
  };
}
