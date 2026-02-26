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
    inferenceOptions: InferenceOptions,
  ): Promise<Message.ToolCallAssistant | Message.ContentAssistant> {
    return this.getDriver(inferenceOptions).generateNextMessage(
      previousMessages,
      tools,
      inferenceOptions,
    );
  }

  async stt(
    audio: AudioContent,
    inferenceOptions: InferenceOptions,
  ): Promise<string> {
    return this.getDriver(inferenceOptions).stt(audio, inferenceOptions);
  }

  async inspectFile(
    file: { name: string; mimeType: string; content: Uint8Array<ArrayBuffer> },
    prompt: string,
    inferenceOptions: InferenceOptions,
  ): Promise<string> {
    return this.getDriver(inferenceOptions).inspectFile(
      file,
      prompt,
      inferenceOptions,
    );
  }

  private getDriver(inferenceOptions: InferenceOptions): InferenceService {
    const provider = this.resolveProvider(inferenceOptions.providerModelRef);

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
    ref: InferenceProviderModelRef | null,
  ): InferenceProvider {
    if (!ref) {
      throw new Error("No model configured.");
    }

    const provider = this.settings.providers.find(
      ({ name }) => name === ref.providerName,
    );
    if (!provider) {
      throw new Error(`Provider "${ref.providerName}" not found in settings.`);
    }

    return provider;
  }
}
