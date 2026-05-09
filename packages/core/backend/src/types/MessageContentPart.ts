import * as v from "valibot";
import MessageContentPartType from "../enums/MessageContentPartType.js";
import AudioContentSchema from "./AudioContent.js";

// Inline schemas for FileRef and ProtoFile from @superego/schema (the schema
// package only exports their TS types). Structural-validation only.
const fileRefSchema = v.object({
  id: v.string(),
  name: v.string(),
  mimeType: v.string(),
});
const protoFileSchema = v.object({
  name: v.string(),
  mimeType: v.string(),
  content: v.instance(Uint8Array),
});

namespace MessageContentPart {
  export interface Text {
    type: MessageContentPartType.Text;
    text: string;
    audio?: import("./AudioContent.js").AudioContent | undefined;
  }
  export interface Audio {
    type: MessageContentPartType.Audio;
    audio: import("./AudioContent.js").AudioContent;
  }
  export interface File {
    type: MessageContentPartType.File;
    file:
      | import("@superego/schema").ProtoFile
      | import("@superego/schema").FileRef;
  }
}
type MessageContentPart =
  | MessageContentPart.Text
  | MessageContentPart.Audio
  | MessageContentPart.File;

const textSchema: v.GenericSchema<MessageContentPart.Text> = v.object({
  type: v.literal(MessageContentPartType.Text),
  text: v.string(),
  audio: v.optional(AudioContentSchema),
});
const audioSchema: v.GenericSchema<MessageContentPart.Audio> = v.object({
  type: v.literal(MessageContentPartType.Audio),
  audio: AudioContentSchema,
});
const fileSchema: v.GenericSchema<MessageContentPart.File> = v.object({
  type: v.literal(MessageContentPartType.File),
  file: v.union([protoFileSchema, fileRefSchema]),
});

const MessageContentPartSchema: v.GenericSchema<MessageContentPart> = v.union([
  textSchema,
  audioSchema,
  fileSchema,
]);
export default MessageContentPartSchema;
export type { MessageContentPart };

// Sub-schemas exposed so other modules can build narrower constraints (e.g.
// Message.User.content uses NonEmptyArray<MessageContentPart>).
export const MessageContentPartTextSchema = textSchema;
export const MessageContentPartAudioSchema = audioSchema;
export const MessageContentPartFileSchema = fileSchema;
