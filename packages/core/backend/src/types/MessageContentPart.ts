import type MessageContentPartType from "../enums/MessageContentPartType.js";
import type AudioContent from "./AudioContent.js";

namespace MessageContentPart {
  export interface Text {
    type: MessageContentPartType.Text;
    text: string;
  }
  export interface Audio {
    type: MessageContentPartType.Audio;
    audio: AudioContent;
  }
}
type MessageContentPart = MessageContentPart.Text | MessageContentPart.Audio;
export default MessageContentPart;
