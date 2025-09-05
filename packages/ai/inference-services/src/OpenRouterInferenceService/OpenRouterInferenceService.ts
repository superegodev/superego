import type { CompletionModel, Message } from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import {
  fromOpenRouterResponse,
  type OpenRouter,
  toOpenRouterRequest,
} from "./converters.js";

export default class OpenRouterInferenceService implements InferenceService {
  constructor(
    private model: CompletionModel,
    private apiKey: string,
  ) {}

  async generateNextMessage(
    previousMessages: Message[],
    tools: InferenceService.Tool[],
  ): Promise<
    | Omit<Message.ToolCallAssistant, "agent">
    | Omit<Message.ContentAssistant, "agent">
  > {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://superego.dev",
          "X-Title": "Superego",
        },
        body: JSON.stringify(
          toOpenRouterRequest(this.model, previousMessages, tools),
        ),
      },
    );

    if (!response.ok) {
      const error = await response.text().catch(() => response.statusText);
      throw new Error(`OpenRouter API error ${response.status}: ${error}`);
    }

    const json = (await response.json()) as OpenRouter.Response;
    return fromOpenRouterResponse(json);
  }
}
