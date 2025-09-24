import type { AudioContent } from "@superego/backend";

export namespace Transcriptions {
  export type Request = FormData;

  export interface Response {
    text: string;
  }
}

export function toTranscriptionsRequest(
  model: string,
  audio: AudioContent,
): Transcriptions.Request {
  const blob = new Blob([audio.content], { type: audio.contentType });
  const formData = new FormData();
  formData.append("model", model);
  formData.append("response_format", "json");
  formData.append("file", blob, "audio.wav");
  return formData;
}

export function fromTranscriptionsResponse(
  response: Transcriptions.Response,
): string {
  return response.text;
}
