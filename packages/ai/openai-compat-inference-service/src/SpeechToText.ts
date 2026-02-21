import type { AudioContent } from "@superego/backend";
import toBase64 from "./toBase64.js";

export namespace SpeechToText {
  export interface TextPart {
    type: "text";
    text: string;
  }
  export interface InputAudioPart {
    type: "input_audio";
    input_audio: {
      data: string;
      format: string;
    };
  }
  export type ContentPart = TextPart | InputAudioPart;

  export type Message =
    | { role: "user"; content: ContentPart[] }
    | { role: "assistant"; content: string };

  ///////////////////
  // Request types //
  ///////////////////

  export type Request = {
    messages: Message[];
    model: string;
    stream: boolean;
    temperature: number;
  };

  ////////////////////
  // Response types //
  ////////////////////

  export interface Response {
    choices: [Choice];
  }

  export interface Choice {
    message: Message & { role: "assistant" };
  }
}

export function toSpeechToTextRequest(
  model: string,
  audio: AudioContent,
): SpeechToText.Request {
  return {
    model: model,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Transcribe the following audio. Output only the transcription, without any additional commentary.",
          },
          {
            type: "input_audio",
            input_audio: {
              data: toBase64(audio.content),
              format: getAudioFormat(audio.contentType),
            },
          },
        ],
      },
    ],
    temperature: 0,
    stream: false,
  };
}

function getAudioFormat(contentType: string): string {
  const mapping: Record<string, string> = {
    "audio/mpeg": "mp3",
    "audio/mpga": "mp3",
    "audio/wave": "wav",
    "audio/x-m4a": "m4a",
    "audio/mp4": "m4a",
  };
  return mapping[contentType] ?? contentType.split("/")[1] ?? "wav";
}

export function fromSpeechToTextResponse(
  response: SpeechToText.Response,
): string {
  const { message } = response.choices[0];
  return message.content;
}
