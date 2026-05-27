import {
  AssistantName,
  type Conversation,
  ConversationStatus,
  type DeveloperPrompts,
  type LiteConversation,
  type Message,
  type MessageContentPart,
  MessageContentPartType,
  type MessageGenerationStats,
  type NonEmptyArray,
  MessageRole,
  type ToolCall,
  type ToolResult,
} from "@superego/backend";
import * as v from "valibot";
import unknownResultError from "../../global/unknownResultError.js";
import { conversationId, messageId } from "../ids.js";
import { audioContent } from "./audioContent.js";
import { inferenceOptions } from "./inference.js";

export function messageGenerationStats(): v.GenericSchema<
  unknown,
  MessageGenerationStats
> {
  return v.strictObject({
    timeTaken: v.number(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    totalTokens: v.number(),
    cost: v.optional(v.number()),
  });
}

const fileRefOrProtoFile = () =>
  v.union([
    v.strictObject({
      id: v.string(),
      name: v.string(),
      mimeType: v.string(),
    }),
    v.strictObject({
      name: v.string(),
      mimeType: v.string(),
      content: v.instance(Uint8Array),
    }),
  ]);

const messageContentPartText = () =>
  v.strictObject({
    type: v.literal(MessageContentPartType.Text),
    text: v.string(),
    audio: v.optional(audioContent()),
  });

const messageContentPartAudio = () =>
  v.strictObject({
    type: v.literal(MessageContentPartType.Audio),
    audio: audioContent(),
  });

const messageContentPartFile = () =>
  v.strictObject({
    type: v.literal(MessageContentPartType.File),
    file: fileRefOrProtoFile(),
  });

export function messageContentPart(): v.GenericSchema<
  unknown,
  MessageContentPart
> {
  return v.union([
    messageContentPartText(),
    messageContentPartAudio(),
    messageContentPartFile(),
  ]) as v.GenericSchema<unknown, MessageContentPart>;
}

export function userMessageContent(): v.GenericSchema<
  unknown,
  NonEmptyArray<MessageContentPart>
> {
  return v.pipe(
    v.array(messageContentPart()),
    v.minLength(1),
  ) as unknown as v.GenericSchema<unknown, NonEmptyArray<MessageContentPart>>;
}

// ToolCall and ToolResult contain many discriminated variants and reference
// types that come from many parts of the system. Validate the outer envelope
// strictly and the input/output payloads loosely — they're authored by the
// inference pipeline, not arbitrary callers, so structural correctness is
// already very high. The boundary check still catches gross corruption.
export function toolCall(): v.GenericSchema<unknown, ToolCall> {
  return v.strictObject({
    id: v.string(),
    tool: v.string(),
    input: v.any(),
  }) as v.GenericSchema<unknown, ToolCall>;
}

export function toolResult(): v.GenericSchema<unknown, ToolResult> {
  return v.strictObject({
    tool: v.string(),
    toolCallId: v.string(),
    output: v.any(),
    artifacts: v.optional(v.any()),
  }) as unknown as v.GenericSchema<unknown, ToolResult>;
}

const reasoning = () =>
  v.strictObject({
    content: v.optional(v.string()),
    encryptedContent: v.optional(v.string()),
    contentSignature: v.optional(v.string()),
    summary: v.optional(v.string()),
  });

const developerMessage = () =>
  v.strictObject({
    role: v.literal(MessageRole.Developer),
    content: v.tuple([messageContentPartText()]),
  });

const userContextMessage = () =>
  v.strictObject({
    role: v.literal(MessageRole.UserContext),
    content: v.tuple([messageContentPartText()]),
  });

const userMessage = () =>
  v.strictObject({
    id: messageId(),
    role: v.literal(MessageRole.User),
    content: userMessageContent(),
    createdAt: v.date(),
  });

const toolMessage = () =>
  v.strictObject({
    id: messageId(),
    role: v.literal(MessageRole.Tool),
    toolResults: v.array(toolResult()),
    createdAt: v.date(),
  });

const contentAssistantMessage = () =>
  v.strictObject({
    id: messageId(),
    role: v.literal(MessageRole.Assistant),
    content: v.pipe(v.array(messageContentPartText()), v.minLength(1)),
    reasoning: reasoning(),
    inferenceOptions: inferenceOptions("completion"),
    generationStats: messageGenerationStats(),
    createdAt: v.date(),
  });

const toolCallAssistantMessage = () =>
  v.strictObject({
    id: messageId(),
    role: v.literal(MessageRole.Assistant),
    toolCalls: v.array(toolCall()),
    reasoning: reasoning(),
    inferenceOptions: inferenceOptions("completion"),
    generationStats: messageGenerationStats(),
    createdAt: v.date(),
  });

export function message(): v.GenericSchema<unknown, Message> {
  return v.union([
    developerMessage(),
    userContextMessage(),
    userMessage(),
    toolMessage(),
    contentAssistantMessage(),
    toolCallAssistantMessage(),
  ]) as v.GenericSchema<unknown, Message>;
}

export function conversation(): v.GenericSchema<unknown, Conversation> {
  return v.union([
    v.strictObject({
      id: conversationId(),
      assistant: v.picklist(Object.values(AssistantName)),
      title: v.nullable(v.string()),
      hasOutdatedContext: v.boolean(),
      canRetryLastResponse: v.boolean(),
      messages: v.array(message()),
      createdAt: v.date(),
      status: v.literal(ConversationStatus.Idle),
      processingStartedAt: v.null(),
      error: v.null(),
    }),
    v.strictObject({
      id: conversationId(),
      assistant: v.picklist(Object.values(AssistantName)),
      title: v.nullable(v.string()),
      hasOutdatedContext: v.boolean(),
      canRetryLastResponse: v.boolean(),
      messages: v.array(message()),
      createdAt: v.date(),
      status: v.literal(ConversationStatus.Processing),
      processingStartedAt: v.date(),
      error: v.null(),
    }),
    v.strictObject({
      id: conversationId(),
      assistant: v.picklist(Object.values(AssistantName)),
      title: v.nullable(v.string()),
      hasOutdatedContext: v.boolean(),
      canRetryLastResponse: v.boolean(),
      messages: v.array(message()),
      createdAt: v.date(),
      status: v.literal(ConversationStatus.Error),
      processingStartedAt: v.null(),
      error: unknownResultError(),
    }),
  ]) as v.GenericSchema<unknown, Conversation>;
}

export function liteConversation(): v.GenericSchema<unknown, LiteConversation> {
  return v.union([
    v.strictObject({
      id: conversationId(),
      assistant: v.picklist(Object.values(AssistantName)),
      title: v.nullable(v.string()),
      hasOutdatedContext: v.boolean(),
      canRetryLastResponse: v.boolean(),
      createdAt: v.date(),
      status: v.literal(ConversationStatus.Idle),
      processingStartedAt: v.null(),
      error: v.null(),
    }),
    v.strictObject({
      id: conversationId(),
      assistant: v.picklist(Object.values(AssistantName)),
      title: v.nullable(v.string()),
      hasOutdatedContext: v.boolean(),
      canRetryLastResponse: v.boolean(),
      createdAt: v.date(),
      status: v.literal(ConversationStatus.Processing),
      processingStartedAt: v.date(),
      error: v.null(),
    }),
    v.strictObject({
      id: conversationId(),
      assistant: v.picklist(Object.values(AssistantName)),
      title: v.nullable(v.string()),
      hasOutdatedContext: v.boolean(),
      canRetryLastResponse: v.boolean(),
      createdAt: v.date(),
      status: v.literal(ConversationStatus.Error),
      processingStartedAt: v.null(),
      error: unknownResultError(),
    }),
  ]) as v.GenericSchema<unknown, LiteConversation>;
}

export function developerPrompts(): v.GenericSchema<unknown, DeveloperPrompts> {
  return v.strictObject({
    [AssistantName.CollectionCreator]: v.string(),
    [AssistantName.Factotum]: v.string(),
  }) as v.GenericSchema<unknown, DeveloperPrompts>;
}
