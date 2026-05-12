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
import { conversationId, messageId } from "../helpers/idSchemas.js";
import { audioContent } from "./audioContent.js";
import { inferenceOptions } from "./inference.js";

const resultErrorRecord = () =>
  v.looseObject({ name: v.string(), details: v.any() });

export function messageGenerationStats(): v.GenericSchema<
  unknown,
  MessageGenerationStats
> {
  return v.looseObject({
    timeTaken: v.number(),
    inputTokens: v.number(),
    outputTokens: v.number(),
    totalTokens: v.number(),
    cost: v.optional(v.number()),
  });
}

const fileRefOrProtoFile = () =>
  v.union([
    v.looseObject({
      id: v.string(),
      name: v.string(),
      mimeType: v.string(),
    }),
    v.looseObject({
      name: v.string(),
      mimeType: v.string(),
      content: v.instance(Uint8Array),
    }),
  ]);

const messageContentPartText = () =>
  v.looseObject({
    type: v.literal(MessageContentPartType.Text),
    text: v.string(),
    audio: v.optional(audioContent()),
  });

const messageContentPartAudio = () =>
  v.looseObject({
    type: v.literal(MessageContentPartType.Audio),
    audio: audioContent(),
  });

const messageContentPartFile = () =>
  v.looseObject({
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

export function nonEmptyMessageContentParts(): v.GenericSchema<
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
  return v.looseObject({
    id: v.string(),
    tool: v.string(),
    input: v.any(),
  }) as v.GenericSchema<unknown, ToolCall>;
}

export function toolResult(): v.GenericSchema<unknown, ToolResult> {
  return v.looseObject({
    tool: v.string(),
    toolCallId: v.string(),
    output: v.looseObject({}),
  }) as unknown as v.GenericSchema<unknown, ToolResult>;
}

const reasoning = () =>
  v.looseObject({
    content: v.optional(v.string()),
    encryptedContent: v.optional(v.string()),
    contentSignature: v.optional(v.string()),
    summary: v.optional(v.string()),
  });

const developerMessage = () =>
  v.looseObject({
    role: v.literal(MessageRole.Developer),
    content: v.tuple([messageContentPartText()]),
  });

const userContextMessage = () =>
  v.looseObject({
    role: v.literal(MessageRole.UserContext),
    content: v.tuple([messageContentPartText()]),
  });

const userMessage = () =>
  v.looseObject({
    id: messageId(),
    role: v.literal(MessageRole.User),
    content: nonEmptyMessageContentParts(),
    createdAt: v.date(),
  });

const toolMessage = () =>
  v.looseObject({
    id: messageId(),
    role: v.literal(MessageRole.Tool),
    toolResults: v.array(toolResult()),
    createdAt: v.date(),
  });

const contentAssistantMessage = () =>
  v.looseObject({
    id: messageId(),
    role: v.literal(MessageRole.Assistant),
    content: v.pipe(v.array(messageContentPartText()), v.minLength(1)),
    reasoning: reasoning(),
    inferenceOptions: inferenceOptions("completion"),
    generationStats: messageGenerationStats(),
    createdAt: v.date(),
  });

const toolCallAssistantMessage = () =>
  v.looseObject({
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

const conversationStatusDiscriminator = () =>
  v.union([
    v.looseObject({
      status: v.literal(ConversationStatus.Idle),
      processingStartedAt: v.null(),
      error: v.null(),
    }),
    v.looseObject({
      status: v.literal(ConversationStatus.Processing),
      processingStartedAt: v.date(),
      error: v.null(),
    }),
    v.looseObject({
      status: v.literal(ConversationStatus.Error),
      processingStartedAt: v.null(),
      error: resultErrorRecord(),
    }),
  ]);

export function conversation(): v.GenericSchema<unknown, Conversation> {
  return v.intersect([
    v.looseObject({
      id: conversationId(),
      assistant: v.picklist(Object.values(AssistantName)),
      title: v.nullable(v.string()),
      hasOutdatedContext: v.boolean(),
      canRetryLastResponse: v.boolean(),
      messages: v.array(message()),
      createdAt: v.date(),
    }),
    conversationStatusDiscriminator(),
  ]) as v.GenericSchema<unknown, Conversation>;
}

export function liteConversation(): v.GenericSchema<unknown, LiteConversation> {
  return v.intersect([
    v.looseObject({
      id: conversationId(),
      assistant: v.picklist(Object.values(AssistantName)),
      title: v.nullable(v.string()),
      hasOutdatedContext: v.boolean(),
      canRetryLastResponse: v.boolean(),
      createdAt: v.date(),
    }),
    conversationStatusDiscriminator(),
  ]) as v.GenericSchema<unknown, LiteConversation>;
}

export function developerPrompts(): v.GenericSchema<unknown, DeveloperPrompts> {
  return v.looseObject({
    [AssistantName.CollectionCreator]: v.string(),
    [AssistantName.Factotum]: v.string(),
  }) as v.GenericSchema<unknown, DeveloperPrompts>;
}
