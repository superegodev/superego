import * as v from "valibot";
import { AssistantNameSchema } from "../enums/AssistantName.js";
import ConversationStatus from "../enums/ConversationStatus.js";
import ConversationIdSchema from "../ids/ConversationId.js";

const errorShape = v.object({ name: v.string(), details: v.any() });

const baseLiteEntries = {
  id: ConversationIdSchema,
  assistant: AssistantNameSchema,
  title: v.nullable(v.string()),
  hasOutdatedContext: v.boolean(),
  canRetryLastResponse: v.boolean(),
  createdAt: v.date(),
};

const LiteConversationSchema = v.variant("status", [
  v.object({
    ...baseLiteEntries,
    status: v.literal(ConversationStatus.Idle),
    processingStartedAt: v.null(),
    error: v.null(),
  }),
  v.object({
    ...baseLiteEntries,
    status: v.literal(ConversationStatus.Processing),
    processingStartedAt: v.date(),
    error: v.null(),
  }),
  v.object({
    ...baseLiteEntries,
    status: v.literal(ConversationStatus.Error),
    processingStartedAt: v.null(),
    error: errorShape,
  }),
]);
export default LiteConversationSchema;
export type LiteConversation = v.InferOutput<typeof LiteConversationSchema>;
