import type {
  AudioContent,
  InferenceOptions,
  Message,
} from "@superego/backend";
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
    inferenceOptions: InferenceOptions<"completion">,
  ): Promise<Message.ToolCallAssistant | Message.ContentAssistant>;

  stt(
    audio: AudioContent,
    inferenceOptions: InferenceOptions<"transcription">,
  ): Promise<string>;

  inspectFile(
    file: {
      name: string;
      mimeType: string;
      content: Uint8Array<ArrayBuffer>;
    },
    prompt: string,
    inferenceOptions: InferenceOptions<"fileInspection">,
  ): Promise<string>;
}

export default InferenceService;
