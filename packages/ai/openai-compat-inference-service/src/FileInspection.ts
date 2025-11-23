export namespace FileInspection {
  export type Message =
    | { role: "user"; content: ContentPart[] }
    | { role: "assistant"; content: string };

  export interface TextPart {
    type: "text";
    text: string;
  }
  export interface ImagePart {
    type: "image_url";
    image_url: {
      url: string;
    };
  }
  export interface VideoPart {
    type: "video_url";
    video_url: {
      url: string;
    };
  }
  export interface FilePart {
    type: "file";
    file: {
      filename: string;
      file_data: string;
    };
  }
  export type ContentPart = TextPart | ImagePart | VideoPart | FilePart;

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

export function toFileInspectionRequest(
  model: string,
  file: { name: string; mimeType: string; content: Uint8Array<ArrayBuffer> },
  prompt: string,
): FileInspection.Request {
  const fileDataUrl = toDataURL(file.content, file.mimeType);
  return {
    model: model,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          file.mimeType.startsWith("image/")
            ? { type: "image_url", image_url: { url: fileDataUrl } }
            : file.mimeType.startsWith("video/")
              ? { type: "video_url", video_url: { url: fileDataUrl } }
              : {
                  type: "file",
                  file: { filename: file.name, file_data: fileDataUrl },
                },
        ],
      },
    ],
    // TODO: move this to configuration.
    temperature: 0.7,
    stream: false,
  };
}

function toDataURL(content: Uint8Array<ArrayBuffer>, mimeType: string): string {
  let base64: string;

  if (typeof Buffer !== "undefined") {
    base64 = Buffer.from(content).toString("base64");
  } else {
    // 32KB chunks
    const CHUNK_SIZE = 0x8000;
    let binary = "";
    for (let i = 0; i < content.length; i += CHUNK_SIZE) {
      binary += String.fromCharCode.apply(
        null,
        Array.from(content.subarray(i, i + CHUNK_SIZE)),
      );
    }
    base64 = btoa(binary);
  }

  return `data:${mimeType};base64,${base64}`;
}

export function fromFileInspectionResponse(
  response: FileInspection.Response,
): string {
  const { message } = response.choices[0];
  return message.content;
}
