import type {
  AudioContent,
  InferenceModel,
  InferenceModelId,
  InferenceProvider,
  InferenceSettings,
  Message,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import { failedResponseToError } from "@superego/shared-utils";
import {
  type ChatCompletions,
  fromChatCompletionsResponse,
  toChatCompletionsRequest,
} from "./ChatCompletions.js";
import {
  type FileInspection,
  fromFileInspectionResponse,
  toFileInspectionRequest,
} from "./FileInspection.js";
import {
  fromSpeechToTextResponse,
  type SpeechToText,
  toSpeechToTextRequest,
} from "./SpeechToText.js";

export default class OpenAICompatInferenceService implements InferenceService {
  constructor(private settings: InferenceSettings) {}

  async generateNextMessage(
    previousMessages: Message[],
    tools: InferenceService.Tool[],
  ): Promise<Message.ToolCallAssistant | Message.ContentAssistant> {
    const { model, provider } = this.resolve(this.settings.defaultChatModel);

    const requestBody = toChatCompletionsRequest(
      model.name,
      previousMessages,
      tools,
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

    await this.handleError("generateNextMessage", requestBody, response);

    const json = (await response.json()) as ChatCompletions.Response;
    return fromChatCompletionsResponse(json);
  }

  async stt(audio: AudioContent): Promise<string> {
    const { model, provider } = this.resolve(
      this.settings.defaultTranscriptionModel,
    );

    const requestBody = toSpeechToTextRequest(model.name, audio);
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

    const json = (await response.json()) as SpeechToText.Response;
    return fromSpeechToTextResponse(json);
  }

  async inspectFile(
    file: { name: string; mimeType: string; content: Uint8Array<ArrayBuffer> },
    prompt: string,
  ): Promise<string> {
    const { model, provider } = this.resolve(
      this.settings.defaultFileInspectionModel,
    );

    const requestBody = toFileInspectionRequest(model.name, file, prompt);
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

    const json = (await response.json()) as FileInspection.Response;
    return fromFileInspectionResponse(json);
  }

  private resolve(modelId: InferenceModelId | null): {
    model: InferenceModel;
    provider: InferenceProvider;
  } {
    if (!modelId) {
      throw new Error("No model configured.");
    }
    const model = this.settings.models.find((m) => m.id === modelId);
    if (!model) {
      throw new Error(`Model "${modelId}" not found in settings.`);
    }
    const provider = this.settings.providers.find(
      (provider) => provider.name === model.providerName,
    );
    if (!provider) {
      throw new Error(
        `Provider "${model.providerName}" not found in settings.`,
      );
    }
    return { model, provider };
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
