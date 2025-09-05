import { CompletionModel, type Message } from "@superego/backend";
import type { InferenceService } from "@superego/executing-backend";
import { OpenAI } from "openai";
import {
  fromOpenaiOutputItems,
  toOpenaiInputItem,
  toOpenaiTool,
} from "./converters.js";

export default class OpenaiInferenceService implements InferenceService {
  private openai: OpenAI;
  constructor(
    private model: CompletionModel,
    apiKey: string,
  ) {
    this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  async generateNextMessage(
    previousMessages: Message[],
    tools: InferenceService.Tool[],
  ): Promise<
    | Omit<Message.ToolCallAssistant, "agent">
    | Omit<Message.ContentAssistant, "agent">
  > {
    const response = await this.openai.responses.create({
      model: this.model.slice("OpenAI_".length),
      tools: tools.map(toOpenaiTool),
      input: previousMessages.flatMap(toOpenaiInputItem),
      stream: false,
      store: false,
      reasoning:
        this.model === CompletionModel.OpenAIGpt5Mini
          ? { effort: "minimal", summary: null }
          : undefined,
    });
    return fromOpenaiOutputItems(response.output);
  }
}
