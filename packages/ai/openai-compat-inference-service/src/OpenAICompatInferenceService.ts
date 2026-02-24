import type {
  AudioContent,
  InferenceModel,
  InferenceOptions,
  InferenceProvider,
  InferenceProviderModelRef,
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
    inferenceOptions: InferenceOptions,
  ): Promise<Message.ToolCallAssistant | Message.ContentAssistant> {
    const { model, provider } = this.resolve(inferenceOptions.providerModelRef);

    const requestBody = toChatCompletionsRequest(
      model.id,
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
    return fromChatCompletionsResponse(json, inferenceOptions);
  }

  async stt(audio: AudioContent): Promise<string> {
    const { model, provider } = this.resolve(
      this.settings.defaults.transcription,
    );

    const requestBody = toSpeechToTextRequest(model.id, audio);
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
      this.settings.defaults.fileInspection,
    );

    const requestBody = toFileInspectionRequest(model.id, file, prompt);
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

  private resolve(ref: InferenceProviderModelRef | null): {
    model: InferenceModel;
    provider: InferenceProvider;
  } {
    if (!ref) {
      throw new Error("No model configured.");
    }
    const provider = this.settings.providers.find(
      (p) => p.name === ref.providerName,
    );
    if (!provider) {
      throw new Error(`Provider "${ref.providerName}" not found in settings.`);
    }
    const model = provider.models.find((m) => m.id === ref.modelId);
    if (!model) {
      throw new Error(
        `Model "${ref.modelId}" not found in provider "${ref.providerName}".`,
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
