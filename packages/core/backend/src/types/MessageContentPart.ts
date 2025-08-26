import type MessageContentPartType from "../enums/MessageContentPartType.js";

namespace MessageContentPart {
  export interface Text {
    type: MessageContentPartType.Text;
    text: string;
    // EVOLUTION: optional audio attached. Transcribed for user messages,
    // synthesized for assistant messages.
  }
}
type MessageContentPart = MessageContentPart.Text;
export default MessageContentPart;
