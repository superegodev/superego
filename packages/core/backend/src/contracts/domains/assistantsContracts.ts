import * as v from "valibot";
import { AssistantNameSchema } from "../../enums/AssistantName.js";
import ArgumentsNotValidSchema from "../../errors/ArgumentsNotValid.js";
import CannotContinueConversationSchema from "../../errors/CannotContinueConversation.js";
import CannotRecoverConversationSchema from "../../errors/CannotRecoverConversation.js";
import CannotRetryLastResponseSchema from "../../errors/CannotRetryLastResponse.js";
import CommandConfirmationNotValidSchema from "../../errors/CommandConfirmationNotValid.js";
import ConversationNotFoundSchema from "../../errors/ConversationNotFound.js";
import FilesNotFoundSchema from "../../errors/FilesNotFound.js";
import InferenceOptionsNotValidSchema from "../../errors/InferenceOptionsNotValid.js";
import UnexpectedErrorSchema from "../../errors/UnexpectedError.js";
import ConversationIdSchema from "../../ids/ConversationId.js";
import ConversationSchema from "../../types/Conversation.js";
import DeveloperPromptsSchema from "../../types/DeveloperPrompts.js";
import { InferenceOptionsCompletionSchema } from "../../types/InferenceOptions.js";
import LiteConversationSchema from "../../types/LiteConversation.js";
import MessageContentPartSchema from "../../types/MessageContentPart.js";
import { nonEmptyArraySchema } from "../../types/NonEmptyArray.js";
import { textSearchResultSchema } from "../../types/TextSearchResult.js";

const userMessageContentSchema = nonEmptyArraySchema(MessageContentPartSchema);

export const assistantsContracts = {
  startConversation: {
    argumentsSchema: v.tuple([
      AssistantNameSchema,
      userMessageContentSchema,
      InferenceOptionsCompletionSchema,
    ]),
    dataSchema: ConversationSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      FilesNotFoundSchema,
      InferenceOptionsNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
  continueConversation: {
    argumentsSchema: v.tuple([
      ConversationIdSchema,
      userMessageContentSchema,
      InferenceOptionsCompletionSchema,
    ]),
    dataSchema: ConversationSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      ConversationNotFoundSchema,
      CannotContinueConversationSchema,
      FilesNotFoundSchema,
      InferenceOptionsNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
  retryLastResponse: {
    argumentsSchema: v.tuple([
      ConversationIdSchema,
      InferenceOptionsCompletionSchema,
    ]),
    dataSchema: ConversationSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      ConversationNotFoundSchema,
      CannotRetryLastResponseSchema,
      InferenceOptionsNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
  recoverConversation: {
    argumentsSchema: v.tuple([
      ConversationIdSchema,
      InferenceOptionsCompletionSchema,
    ]),
    dataSchema: ConversationSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      ConversationNotFoundSchema,
      CannotRecoverConversationSchema,
      InferenceOptionsNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
  deleteConversation: {
    argumentsSchema: v.tuple([ConversationIdSchema, v.string()]),
    dataSchema: v.null(),
    errorSchemas: [
      ArgumentsNotValidSchema,
      ConversationNotFoundSchema,
      CommandConfirmationNotValidSchema,
      UnexpectedErrorSchema,
    ],
  },
  listConversations: {
    argumentsSchema: v.tuple([]),
    dataSchema: v.array(LiteConversationSchema),
    errorSchemas: [ArgumentsNotValidSchema, UnexpectedErrorSchema],
  },
  getConversation: {
    argumentsSchema: v.tuple([ConversationIdSchema]),
    dataSchema: ConversationSchema,
    errorSchemas: [
      ArgumentsNotValidSchema,
      ConversationNotFoundSchema,
      UnexpectedErrorSchema,
    ],
  },
  getLiveConversation: {
    argumentsSchema: v.tuple([ConversationIdSchema]),
    dataSchema: v.nullable(ConversationSchema),
    errorSchemas: [ArgumentsNotValidSchema, UnexpectedErrorSchema],
  },
  searchConversations: {
    argumentsSchema: v.tuple([v.string(), v.object({ limit: v.number() })]),
    dataSchema: v.array(textSearchResultSchema(LiteConversationSchema)),
    errorSchemas: [ArgumentsNotValidSchema, UnexpectedErrorSchema],
  },
  getDeveloperPrompts: {
    argumentsSchema: v.tuple([]),
    dataSchema: DeveloperPromptsSchema,
    errorSchemas: [ArgumentsNotValidSchema, UnexpectedErrorSchema],
  },
} as const;
