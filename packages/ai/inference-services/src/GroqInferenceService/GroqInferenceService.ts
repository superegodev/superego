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
  ) {
    this.groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  }

  async generateNextMessage(
    previousMessages: Message[],
    tools: InferenceService.Tool[],
  ): Promise<
    | Omit<Message.ToolCallAssistant, "agent">
    | Omit<Message.ContentAssistant, "agent">
  > {
    const response = await this.groq.chat.completions.create({
      model: this.model.slice("Groq_".length),
      tools: tools.map(toGroqTool),
      messages: previousMessages.flatMap(toGroqMessage),
      stream: false,
    });
    return fromGroqAssistantMessage(response.choices[0]!.message);
  }
}
