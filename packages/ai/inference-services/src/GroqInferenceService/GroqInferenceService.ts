import type { CompletionModel, Message } from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import Groq from "groq-sdk";
import {
  fromGroqAssistantMessage,
  toGroqMessage,
  toGroqTool,
} from "./converters.js";

export default class GroqInferenceService implements InferenceService {
  private groq: Groq;
  constructor(
    private model: CompletionModel,
    apiKey: string,
    baseUrl: string | null,
  ) {
    this.groq = new Groq({
      apiKey: apiKey,
      baseURL: baseUrl,
      dangerouslyAllowBrowser: true,
    });
  }

  async generateNextMessage(
    previousMessages: Message[],
    tools: InferenceService.Tool[],
  ): Promise<Message.Assistant> {
    console.log("generateNextMessage", {
      tools: tools.map(toGroqTool),
      messages: previousMessages.flatMap(toGroqMessage),
    });
    const response = await this.groq.chat.completions.create({
      model: this.model.slice("Groq_".length),
      tools: tools.map(toGroqTool),
      messages: previousMessages.flatMap(toGroqMessage),
      stream: false,
    });
    return fromGroqAssistantMessage(response.choices[0]!.message);
  }
}
