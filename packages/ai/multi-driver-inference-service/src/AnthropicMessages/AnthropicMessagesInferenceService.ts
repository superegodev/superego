import {
  type InferenceModel,
  type InferenceOptions,
  type InferenceProvider,
  type InferenceProviderModelRef,
  type InferenceSettings,
  type Message,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import { failedResponseToError } from "@superego/shared-utils";
import {
  type AnthropicMessages,
  extractTextFromResponse,
  fromAnthropicMessagesResponse,
  toAnthropicMessagesRequest,
} from "./AnthropicMessages.js";

export default class AnthropicMessagesInferenceService
  implements InferenceService
{
  constructor(private settings: InferenceSettings) {}

  async generateNextMessage(
    previousMessages: Message[],
    tools: InferenceService.Tool[],
    inferenceOptions: InferenceOptions<"completion">,
  ): Promise<Message.ToolCallAssistant | Message.ContentAssistant> {
    const { provider, model } = this.resolveProviderAndModel(
      inferenceOptions.completion.providerModelRef,
    );

    const requestBody = toAnthropicMessagesRequest(
      model.id,
      previousMessages,
      tools,
      inferenceOptions.completion.reasoningEffort,
    );

    const startTime = Date.now();
    const response = await fetch(provider.baseUrl, {
      method: "POST",
      headers: {
        ...(provider.apiKey ? { "x-api-key": provider.apiKey } : null),
        "anthropic-dangerous-direct-browser-access": "true",
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    await this.handleError("generateNextMessage", requestBody, response);

    const json = (await response.json()) as AnthropicMessages.Response;
    const timeTaken = Date.now() - startTime;
    return fromAnthropicMessagesResponse(json, inferenceOptions, timeTaken);
  }

  async stt(): Promise<string> {
    throw new Error("STT is not supported by the Anthropic Messages driver.");
  }

  async inspectFile(
    file: { name: string; mimeType: string; content: Uint8Array<ArrayBuffer> },
    prompt: string,
    inferenceOptions: InferenceOptions<"fileInspection">,
  ): Promise<string> {
    const { provider, model } = this.resolveProviderAndModel(
      inferenceOptions.fileInspection.providerModelRef,
    );

    const requestBody = toAnthropicMessagesRequest(
      model.id,
      [
        {
          role: MessageRole.User,
          content: [
            { type: MessageContentPartType.Text, text: prompt },
            { type: MessageContentPartType.File, file },
          ],
          createdAt: new Date(),
        },
      ],
      [],
      null,
    );

    const response = await fetch(provider.baseUrl, {
      method: "POST",
      headers: {
        ...(provider.apiKey ? { "x-api-key": provider.apiKey } : null),
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    await this.handleError("inspectFile", requestBody, response);

    const json = (await response.json()) as AnthropicMessages.Response;
    return extractTextFromResponse(json);
  }

  private resolveProviderAndModel(
    providerModelRef: InferenceProviderModelRef,
  ): { provider: InferenceProvider; model: InferenceModel } {
    const provider = this.settings.providers.find(
      ({ name }) => name === providerModelRef.providerName,
    );
    if (!provider) {
      throw new Error(
        `Provider "${providerModelRef.providerName}" not found in settings.`,
      );
    }

    const model = provider.models.find(
      ({ id }) => id === providerModelRef.modelId,
    );
    if (!model) {
      throw new Error(
        `Model "${providerModelRef.modelId}" not found in provider "${providerModelRef.providerName}".`,
      );
    }

    return { provider, model };
  }

  private async handleError(
    requestMethod: string,
    requestBody: object,
    response: Response,
  ) {
    if (!response.ok) {
      throw await failedResponseToError(requestMethod, requestBody, response);
    }
  }
}
