import * as v from "valibot";
import { AssistantNameSchema } from "../enums/AssistantName.js";
import ConversationStatus from "../enums/ConversationStatus.js";
import ConversationIdSchema from "../ids/ConversationId.js";
import MessageSchema from "./Message.js";

const errorShape = v.object({ name: v.string(), details: v.any() });

const baseConversationEntries = {
  id: ConversationIdSchema,
  assistant: AssistantNameSchema,
  title: v.nullable(v.string()),
  hasOutdatedContext: v.boolean(),
  canRetryLastResponse: v.boolean(),
  messages: v.array(MessageSchema),
  createdAt: v.date(),
};

const ConversationSchema = v.variant("status", [
  v.object({
    ...baseConversationEntries,
    status: v.literal(ConversationStatus.Idle),
    processingStartedAt: v.null(),
    error: v.null(),
  }),
  v.object({
    ...baseConversationEntries,
    status: v.literal(ConversationStatus.Processing),
    processingStartedAt: v.date(),
    error: v.null(),
  }),
  v.object({
    ...baseConversationEntries,
    status: v.literal(ConversationStatus.Error),
    processingStartedAt: v.null(),
    error: errorShape,
  }),
]);
export default ConversationSchema;
export type Conversation = v.InferOutput<typeof ConversationSchema>;
