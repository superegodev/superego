import {
  type Message,
  MessageContentPartType,
  MessageRole,
} from "@superego/backend";
import type {
  InferenceService,
  InferenceServiceFactory,
} from "@superego/executing-backend";

class MockInferenceService implements InferenceService {
  async generateNextMessage(): Promise<Message.ContentAssistant> {
    return {
      role: MessageRole.Assistant,
      content: [{ type: MessageContentPartType.Text, text: "Mock response" }],
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
