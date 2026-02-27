import {
  type AudioContent,
  type InferenceOptions,
  type InferenceProvider,
  InferenceProviderDriver,
  type InferenceProviderModelRef,
  type InferenceSettings,
  type Message,
} from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";

import OpenRouterInferenceService from "./OpenRouter/OpenRouterInferenceService.js";

export default class MultiDriverInferenceService implements InferenceService {
  constructor(private settings: InferenceSettings) {}

  async generateNextMessage(
    previousMessages: Message[],
    tools: InferenceService.Tool[],
    inferenceOptions: InferenceOptions<"completion">,
  ): Promise<Message.ToolCallAssistant | Message.ContentAssistant> {
    return this.getDriver(
      inferenceOptions.completion.providerModelRef,
    ).generateNextMessage(previousMessages, tools, inferenceOptions);
  }

  async stt(
    audio: AudioContent,
    inferenceOptions: InferenceOptions<"transcription">,
  ): Promise<string> {
    return this.getDriver(inferenceOptions.transcription.providerModelRef).stt(
      audio,
      inferenceOptions,
    );
  }

  async inspectFile(
    file: { name: string; mimeType: string; content: Uint8Array<ArrayBuffer> },
    prompt: string,
    inferenceOptions: InferenceOptions<"fileInspection">,
  ): Promise<string> {
    return this.getDriver(
      inferenceOptions.fileInspection.providerModelRef,
    ).inspectFile(file, prompt, inferenceOptions);
  }

  private getDriver(
    providerModelRef: InferenceProviderModelRef,
  ): InferenceService {
    const provider = this.resolveProvider(providerModelRef);
    switch (provider.driver) {
      case InferenceProviderDriver.OpenRouter:
        return new OpenRouterInferenceService(this.settings);
      default:
        throw new Error(
          `Unsupported inference provider driver: "${provider.driver}"`,
        );
    }
  }

  private resolveProvider(
    providerModelRef: InferenceProviderModelRef,
  ): InferenceProvider {
    const provider = this.settings.providers.find(
      ({ name }) => name === providerModelRef.providerName,
    );
    if (!provider) {
      throw new Error(
        `Provider "${providerModelRef.providerName}" not found in settings.`,
      );
    }
    return provider;
  }
}
