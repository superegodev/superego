import {
  type AudioContent,
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
  extractTextFromResponse,
  fromResponsesResponse,
  type Responses,
  toResponsesRequest,
} from "./Responses.js";

export default class OpenRouterInferenceService implements InferenceService {
  constructor(private settings: InferenceSettings) {}

  async generateNextMessage(
    previousMessages: Message[],
    tools: InferenceService.Tool[],
    inferenceOptions: InferenceOptions,
  ): Promise<Message.ToolCallAssistant | Message.ContentAssistant> {
    const { model, provider } = this.resolveRef(
      inferenceOptions.providerModelRef,
    );

    const requestBody = toResponsesRequest(model.id, previousMessages, tools);

    const response = await fetch(provider.baseUrl, {
      method: "POST",
      headers: {
        ...(provider.apiKey
          ? { Authorization: `Bearer ${provider.apiKey}` }
          : null),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    await this.handleError("generateNextMessage", requestBody, response);

    const json = (await response.json()) as Responses.Response;
    return fromResponsesResponse(json, inferenceOptions);
  }

  async stt(
    audio: AudioContent,
    inferenceOptions: InferenceOptions,
  ): Promise<string> {
    const { model, provider } = this.resolveRef(
      inferenceOptions.providerModelRef,
    );

    const requestBody = toResponsesRequest(
      model.id,
      [
        {
          role: MessageRole.User,
          content: [
            {
              type: MessageContentPartType.Text,
              text: "Transcribe the following audio. Output only the transcription, without any additional commentary.",
            },
            { type: MessageContentPartType.Audio, audio },
          ],
          createdAt: new Date(),
        },
      ],
      [],
    );

    const response = await fetch(provider.baseUrl, {
      method: "POST",
      headers: {
        ...(provider.apiKey
          ? { Authorization: `Bearer ${provider.apiKey}` }
          : null),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    await this.handleError("stt", requestBody, response);

    const json = (await response.json()) as Responses.Response;
    return extractTextFromResponse(json);
  }

  async inspectFile(
    file: { name: string; mimeType: string; content: Uint8Array<ArrayBuffer> },
    prompt: string,
    inferenceOptions: InferenceOptions,
  ): Promise<string> {
    const { model, provider } = this.resolveRef(
      inferenceOptions.providerModelRef,
    );

    const requestBody = toResponsesRequest(
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
    );

    const response = await fetch(provider.baseUrl, {
      method: "POST",
      headers: {
        ...(provider.apiKey
          ? { Authorization: `Bearer ${provider.apiKey}` }
          : null),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    await this.handleError("inspectFile", requestBody, response);

    const json = (await response.json()) as Responses.Response;
    return extractTextFromResponse(json);
  }

  private resolveRef(ref: InferenceProviderModelRef | null): {
    provider: InferenceProvider;
    model: InferenceModel;
  } {
    if (!ref) {
      throw new Error("No model configured.");
    }

    const provider = this.settings.providers.find(
      ({ name }) => name === ref.providerName,
    );
    if (!provider) {
      throw new Error(`Provider "${ref.providerName}" not found in settings.`);
    }

    const model = provider.models.find(({ id }) => id === ref.modelId);
    if (!model) {
      throw new Error(
        `Model "${ref.modelId}" not found in provider "${ref.providerName}".`,
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
