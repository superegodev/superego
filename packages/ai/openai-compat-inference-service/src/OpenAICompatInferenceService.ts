import type {
  AudioContent,
  InferenceSettings,
  Message,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import {
  type ChatCompletions,
  fromChatCompletionsResponse,
  toChatCompletionsRequest,
} from "./ChatCompletions.js";
import { fromSpeechResponse, toSpeechRequest } from "./Speech.js";
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
    const { completions } = this.settings;
    if (!completions.provider.baseUrl) {
      throw new Error("Missing completions provider base URL.");
    }
    if (!completions.model) {
      throw new Error("Missing completions model.");
    }

    const response = await fetch(completions.provider.baseUrl, {
      method: "POST",
      headers: {
        ...(completions.provider.apiKey
          ? { Authorization: `Bearer ${completions.provider.apiKey}` }
          : null),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        toChatCompletionsRequest(completions.model, previousMessages, tools),
      ),
    });

    await this.handleError("generateNextMessage", response);

    const json = (await response.json()) as ChatCompletions.Response;
    return fromChatCompletionsResponse(json);
  }

  async tts(text: string): Promise<AudioContent> {
    const { speech } = this.settings;
    if (!speech.provider.baseUrl) {
      throw new Error("Missing speech provider base URL.");
    }
    if (!speech.model) {
      throw new Error("Missing speech model.");
    }
    if (!speech.voice) {
      throw new Error("Missing speech voice.");
    }

    const response = await fetch(speech.provider.baseUrl, {
      method: "POST",
      headers: {
        ...(speech.provider.apiKey
          ? { Authorization: `Bearer ${speech.provider.apiKey}` }
          : null),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toSpeechRequest(speech.model, speech.voice, text)),
    });

    await this.handleError("tts", response);

    const arrayBuffer = await response.arrayBuffer();
    return fromSpeechResponse(new Uint8Array(arrayBuffer));
  }

  async stt(audio: AudioContent): Promise<string> {
    const { transcriptions } = this.settings;
    if (!transcriptions.provider.baseUrl) {
      throw new Error("Missing transcriptions provider base URL.");
    }
    if (!transcriptions.model) {
      throw new Error("Missing transcriptions model.");
    }

    const response = await fetch(transcriptions.provider.baseUrl, {
      method: "POST",
      headers: {
        ...(transcriptions.provider.apiKey
          ? { Authorization: `Bearer ${transcriptions.provider.apiKey}` }
          : null),
      },
      body: toTranscriptionsRequest(transcriptions.model, audio),
    });

    await this.handleError("stt", response);

    const json = (await response.json()) as Transcriptions.Response;
    return fromTranscriptionsResponse(json);
  }

  private async handleError(method: string, response: Response) {
    if (!response.ok) {
      const details = await response
        .json()
        .catch(() => response.text())
        .then((text) => ({ error: text }))
        .catch(() => ({ statusText: response.statusText }));
      throw new Error(
        [
          `[OpenAICompatInferenceService.${method}] HTTP ${response.status} error calling ${response.url}:`,
          JSON.stringify(details, null, 2),
        ].join("\n"),
      );
    }
  }
}
