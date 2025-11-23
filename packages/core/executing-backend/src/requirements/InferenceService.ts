import type { AudioContent, Message } from "@superego/backend";
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
  ): Promise<Message.ToolCallAssistant | Message.ContentAssistant>;

  tts(text: string): Promise<AudioContent>;

  stt(audio: AudioContent): Promise<string>;

  inspectFile(
    file: {
      name: string;
      mimeType: string;
      content: Uint8Array<ArrayBuffer>;
    },
    prompt: string,
  ): Promise<string>;
}

export default InferenceService;
