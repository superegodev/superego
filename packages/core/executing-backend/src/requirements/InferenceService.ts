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
  generateNextMessage(
    previousMessages: Message[],
    tools: InferenceService.Tool[],
  ): Promise<Message.Assistant>;
}

export default InferenceService;
