import * as v from "valibot";

enum TranscriptionModel {
  GroqWhisperLargeV3 = "Groq_whisper-large-v3",
  GroqWhisperLargeV3Turbo = "Groq_whisper-large-v3-turbo",
}
export default TranscriptionModel;

export const TranscriptionModelSchema = v.enum(TranscriptionModel);
