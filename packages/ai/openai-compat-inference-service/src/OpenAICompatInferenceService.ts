import type {
  AudioContent,
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
  fromTranscriptionsResponse,
  type Transcriptions,
  toTranscriptionsRequest,
} from "./Transcriptions.js";

export default class OpenAICompatInferenceService implements InferenceService {
  constructor(private settings: InferenceSettings) {}

  async generateNextMessage(
    previousMessages: Message[],
    tools: InferenceService.Tool[],
  ): Promise<Message.ToolCallAssistant | Message.ContentAssistant> {
    const { chatCompletions } = this.settings;
    if (!chatCompletions.provider.baseUrl) {
      throw new Error("Missing chat completions provider base URL.");
    }
    if (!chatCompletions.model) {
      throw new Error("Missing chat completions model.");
    }

    const requestBody = toChatCompletionsRequest(
      chatCompletions.model,
      previousMessages,
      tools,
    );
    const response = await fetch(chatCompletions.provider.baseUrl, {
      method: "POST",
      headers: {
        ...(chatCompletions.provider.apiKey
          ? { Authorization: `Bearer ${chatCompletions.provider.apiKey}` }
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
    const { transcriptions } = this.settings;
    if (!transcriptions.provider.baseUrl) {
      throw new Error("Missing transcriptions provider base URL.");
    }
    if (!transcriptions.model) {
      throw new Error("Missing transcriptions model.");
    }

    const requestBody = toTranscriptionsRequest(transcriptions.model, audio);
    const response = await fetch(transcriptions.provider.baseUrl, {
      method: "POST",
      headers: {
        ...(transcriptions.provider.apiKey
          ? { Authorization: `Bearer ${transcriptions.provider.apiKey}` }
          : null),
      },
      body: requestBody,
    });

    await this.handleError("stt", requestBody, response);

    const json = (await response.json()) as Transcriptions.Response;
    return fromTranscriptionsResponse(json);
  }

  async inspectFile(
    file: { name: string; mimeType: string; content: Uint8Array<ArrayBuffer> },
    prompt: string,
  ): Promise<string> {
    const { fileInspection } = this.settings;
    if (!fileInspection.provider.baseUrl) {
      throw new Error("Missing file inspection provider base URL.");
    }
    if (!fileInspection.model) {
      throw new Error("Missing file inspection model.");
    }

    const requestBody = toFileInspectionRequest(
      fileInspection.model,
      file,
      prompt,
    );
    const response = await fetch(fileInspection.provider.baseUrl, {
      method: "POST",
      headers: {
        ...(fileInspection.provider.apiKey
          ? { Authorization: `Bearer ${fileInspection.provider.apiKey}` }
          : null),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    await this.handleError("inspectFile", requestBody, response);

    const json = (await response.json()) as FileInspection.Response;
    return fromFileInspectionResponse(json);
  }

  private async handleError(
    requestMethod: string,
    requestBody: object | FormData,
    response: Response,
  ) {
    if (!response.ok) {
      throw await failedResponseToError(requestMethod, requestBody, response);
    }
  }
}
