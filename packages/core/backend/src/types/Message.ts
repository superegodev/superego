import * as v from "valibot";
import MessageRole from "../enums/MessageRole.js";
import MessageIdSchema from "../ids/MessageId.js";
import { InferenceOptionsCompletionSchema } from "./InferenceOptions.js";
import MessageContentPartSchema, {
  MessageContentPartTextSchema,
} from "./MessageContentPart.js";
import MessageGenerationStatsSchema from "./MessageGenerationStats.js";
import { nonEmptyArraySchema } from "./NonEmptyArray.js";
import ToolCallSchema from "./ToolCall.js";
import ToolResultSchema from "./ToolResult.js";

const reasoningSchema = v.object({
  content: v.optional(v.string()),
  encryptedContent: v.optional(v.string()),
  contentSignature: v.optional(v.string()),
  summary: v.optional(v.string()),
});

const developerSchema = v.object({
  role: v.literal(MessageRole.Developer),
  content: v.tuple([MessageContentPartTextSchema]),
});
const userContextSchema = v.object({
  role: v.literal(MessageRole.UserContext),
  content: v.tuple([MessageContentPartTextSchema]),
});
const userSchema = v.object({
  id: MessageIdSchema,
  role: v.literal(MessageRole.User),
  content: nonEmptyArraySchema(MessageContentPartSchema),
  createdAt: v.date(),
});
const toolSchema = v.object({
  id: MessageIdSchema,
  role: v.literal(MessageRole.Tool),
  toolResults: v.array(ToolResultSchema),
  createdAt: v.date(),
});
const contentAssistantSchema = v.object({
  id: MessageIdSchema,
  role: v.literal(MessageRole.Assistant),
  content: nonEmptyArraySchema(MessageContentPartTextSchema),
  reasoning: reasoningSchema,
  inferenceOptions: InferenceOptionsCompletionSchema,
  generationStats: MessageGenerationStatsSchema,
  createdAt: v.date(),
});
const toolCallAssistantSchema = v.object({
  id: MessageIdSchema,
  role: v.literal(MessageRole.Assistant),
  toolCalls: v.array(ToolCallSchema),
  reasoning: reasoningSchema,
  inferenceOptions: InferenceOptionsCompletionSchema,
  generationStats: MessageGenerationStatsSchema,
  createdAt: v.date(),
});
const assistantSchema = v.union([
  contentAssistantSchema,
  toolCallAssistantSchema,
]);

namespace Message {
  export type Developer = v.InferOutput<typeof developerSchema>;
  export type UserContext = v.InferOutput<typeof userContextSchema>;
  export type User = v.InferOutput<typeof userSchema>;
  export type Tool = v.InferOutput<typeof toolSchema>;
  export type ContentAssistant = v.InferOutput<typeof contentAssistantSchema>;
  export type ToolCallAssistant = v.InferOutput<typeof toolCallAssistantSchema>;
  export type Assistant = ContentAssistant | ToolCallAssistant;
  export namespace Assistant {
    export type Reasoning = v.InferOutput<typeof reasoningSchema>;
  }
}
type Message =
  | Message.Developer
  | Message.UserContext
  | Message.User
  | Message.Tool
  | Message.Assistant;

const MessageSchema = v.union([
  developerSchema,
  userContextSchema,
  userSchema,
  toolSchema,
  assistantSchema,
]) as v.GenericSchema<Message>;
export default MessageSchema;
export type { Message };
