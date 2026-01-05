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
  formData.append("file", blob, getFilenameForContentType(audio.contentType));
  return formData;
}

function getFilenameForContentType(contentType: string): string {
  return (
    {
      "audio/flac": "audio.flac",
      "audio/m4a": "audio.m4a",
      "audio/mp3": "audio.mp3",
      "audio/mpeg": "audio.mp3",
      "audio/mpga": "audio.mpga",
      "audio/mp4": "audio.m4a",
      "audio/oga": "audio.oga",
      "audio/ogg": "audio.ogg",
      "audio/wav": "audio.wav",
      "audio/wave": "audio.wav",
      "audio/webm": "audio.webm",
      "audio/x-m4a": "audio.m4a",
    }[contentType] ?? "audio.wav"
  );
}

export function fromTranscriptionsResponse(
  response: Transcriptions.Response,
): string {
  return response.text;
}
