import type { AudioContent } from "@superego/backend";

export namespace Speech {
  export interface Request {
    model: string;
    voice: string;
    input: string;
  }

  export type Response = Uint8Array<ArrayBuffer>;
}

export function toSpeechRequest(
  model: string,
  voice: string,
  text: string,
): Speech.Request {
  return {
    model: model,
    voice: voice,
    input: text,
  };
}

export function fromSpeechResponse(response: Speech.Response): AudioContent {
  return { content: response, contentType: "audio/wav" };
}
