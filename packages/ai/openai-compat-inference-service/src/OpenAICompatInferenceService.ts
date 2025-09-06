import type { Message } from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import {
  fromOpenAICompatResponse,
  type OpenAICompat,
  toOpenAICompatRequest,
} from "./converters.js";

export default class OpenAICompatInferenceService implements InferenceService {
  constructor(
    private model: string,
    private baseUrl: string,
    private apiKey: string | null,
  ) {}

  async generateNextMessage(
    previousMessages: Message[],
    tools: InferenceService.Tool[],
  ): Promise<
    | Omit<Message.ToolCallAssistant, "agent">
    | Omit<Message.ContentAssistant, "agent">
  > {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : null),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        toOpenAICompatRequest(this.model, previousMessages, tools),
      ),
    });

    if (!response.ok) {
      const details = await response
        .json()
        .catch(() => response.text())
        .then((text) => ({ error: text }))
        .catch(() => ({ statusText: response.statusText }));
      throw new Error(
        [
          `HTTP ${response.status} error calling the OpenAI compatible API:`,
          JSON.stringify(details, null, 2),
        ].join("\n"),
      );
    }

    const json = (await response.json()) as OpenAICompat.Response;
    return fromOpenAICompatResponse(json);
  }
}
