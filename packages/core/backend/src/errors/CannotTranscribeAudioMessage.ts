import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import ConversationIdSchema from "../ids/ConversationId.js";

const CannotTranscribeAudioMessageSchema = defineError(
  "CannotTranscribeAudioMessage",
  v.object({ conversationId: ConversationIdSchema }),
);
export default CannotTranscribeAudioMessageSchema;
export type CannotTranscribeAudioMessage = v.InferOutput<
  typeof CannotTranscribeAudioMessageSchema
>;
