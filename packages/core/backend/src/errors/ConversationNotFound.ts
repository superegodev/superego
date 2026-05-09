import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import ConversationIdSchema from "../ids/ConversationId.js";

const ConversationNotFoundSchema = defineError(
  "ConversationNotFound",
  v.object({ conversationId: ConversationIdSchema }),
);
export default ConversationNotFoundSchema;
export type ConversationNotFound = v.InferOutput<
  typeof ConversationNotFoundSchema
>;
