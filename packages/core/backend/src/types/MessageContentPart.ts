import type MessageContentPartType from "../enums/MessageContentPartType.js";
import type AudioContent from "./AudioContent.js";
import type FileContent from "./FileContent.js";

namespace MessageContentPart {
  export interface Text {
    type: MessageContentPartType.Text;
    text: string;
    audio?: AudioContent | undefined;
  }
  export interface Audio {
    type: MessageContentPartType.Audio;
    audio: AudioContent;
  }
  export interface File {
    type: MessageContentPartType.File;
    file: FileContent;
  }
}
type MessageContentPart =
  | MessageContentPart.Text
  | MessageContentPart.Audio
  | MessageContentPart.File;
export default MessageContentPart;
