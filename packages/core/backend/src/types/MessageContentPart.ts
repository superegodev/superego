import type { FileRef, ProtoFile } from "@superego/schema";
import type MessageContentPartType from "../enums/MessageContentPartType.js";
import type AudioContent from "./AudioContent.js";

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
    file: ProtoFile | FileRef;
  }
}
type MessageContentPart =
  | MessageContentPart.Text
  | MessageContentPart.Audio
  | MessageContentPart.File;
export default MessageContentPart;
