import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import ConversationIdSchema from "../ids/ConversationId.js";

const ConversationStatusNotProcessingSchema = defineError(
  "ConversationStatusNotProcessing",
  v.object({ conversationId: ConversationIdSchema }),
);
export default ConversationStatusNotProcessingSchema;
export type ConversationStatusNotProcessing = v.InferOutput<
  typeof ConversationStatusNotProcessingSchema
>;
