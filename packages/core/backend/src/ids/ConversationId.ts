import * as v from "valibot";
import { idPattern } from "./_internal/idPattern.js";

type ConversationId = `Conversation_${string}`;
const ConversationIdSchema = v.pipe(
  v.string(),
  v.regex(idPattern("Conversation")),
) as v.GenericSchema<ConversationId, ConversationId>;
export default ConversationIdSchema;
export type { ConversationId };
