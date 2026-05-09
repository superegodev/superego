import * as v from "valibot";

enum MessageContentPartType {
  Text = "Text",
  Audio = "Audio",
  File = "File",
}
export default MessageContentPartType;

export const MessageContentPartTypeSchema = v.enum(MessageContentPartType);
