import {
  type InferenceOptions,
  type Message,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import type {
  InferenceService,
  InferenceServiceFactory,
} from "@superego/executing-backend";

class MockInferenceService implements InferenceService {
  async generateNextMessage(
    _previousMessages: Message[],
    _tools: InferenceService.Tool[],
    inferenceOptions: InferenceOptions<"completion">,
  ): Promise<Message.ContentAssistant> {
    return {
      role: MessageRole.Assistant,
      content: [{ type: MessageContentPartType.Text, text: "Mock response" }],
      inferenceOptions,
      generationStats: {
        timeTaken: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
      },
      createdAt: new Date(),
    };
  }

  async stt(): Promise<string> {
    return "Mock transcription";
  }

  async inspectFile(): Promise<string> {
    return "Mock file inspection";
  }
}

export default class MockInferenceServiceFactory
  implements InferenceServiceFactory
{
  create(): InferenceService {
    return new MockInferenceService();
  }
}
