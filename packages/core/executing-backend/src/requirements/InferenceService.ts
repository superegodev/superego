import type { Message } from "@superego/backend";
import type { JSONSchema7 } from "json-schema";

namespace InferenceService {
  export enum ToolType {
    Function = "Function",
  }

  export interface FunctionTool {
    type: ToolType.Function;
    name: string;
    description: string;
    inputSchema: JSONSchema7 & { type: "object" };
  }

  export type Tool = FunctionTool;
}

interface InferenceService {
  // TODO: handle multiple messages. Apparently both OpenAI and Anthropic models
  // can output multiple messages.
  generateNextMessage(
    previousMessages: Message[],
    tools: InferenceService.Tool[],
  ): Promise<
    | Omit<Message.ToolCallAssistant, "agent">
    | Omit<Message.ContentAssistant, "agent">
  >;
}

export default InferenceService;
