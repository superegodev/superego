import type { CompletionModel, Message } from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import fromGoogleGenerateContentResponse from "./fromGoogleGenerateContentResponse.js";
import type Google from "./Google.js";
import toGoogleGenerateContentRequest from "./toGoogleGenerateContentRequest.js";

export default class GoogleInferenceService implements InferenceService {
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
    const modelName = this.model.slice("Google_".length);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey,
      },
      body: JSON.stringify(
        toGoogleGenerateContentRequest(previousMessages, tools),
      ),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => response.statusText);
      throw new Error(`Google API error ${response.status}: ${error}`);
    }

    const json = (await response.json()) as Google.GenerateContentResponse;
    return fromGoogleGenerateContentResponse(json);
  }
}
