import {
  type BackgroundJob,
  BackgroundJobName,
  BackgroundJobStatus,
  type LiteBackgroundJob,
} from "@superego/backend";
import * as v from "valibot";
import unknownResultError from "../../global/unknownResultError.js";
import { backgroundJobId, conversationId } from "../ids.js";
import { inferenceOptions } from "./inference.js";

const enqueuedStatusEntries = () => ({
  status: v.literal(BackgroundJobStatus.Enqueued),
  startedProcessingAt: v.null(),
  finishedProcessingAt: v.null(),
  error: v.null(),
});

const processingStatusEntries = () => ({
  status: v.literal(BackgroundJobStatus.Processing),
  startedProcessingAt: v.date(),
  finishedProcessingAt: v.null(),
  error: v.null(),
});

const succeededStatusEntries = () => ({
  status: v.literal(BackgroundJobStatus.Succeeded),
  startedProcessingAt: v.date(),
  finishedProcessingAt: v.date(),
  error: v.null(),
});

const failedStatusEntries = () => ({
  status: v.literal(BackgroundJobStatus.Failed),
  startedProcessingAt: v.date(),
  finishedProcessingAt: v.date(),
  error: unknownResultError(),
});

const liteEnqueuedStatusEntries = () => ({
  status: v.literal(BackgroundJobStatus.Enqueued),
  startedProcessingAt: v.null(),
  finishedProcessingAt: v.null(),
});

const liteProcessingStatusEntries = () => ({
  status: v.literal(BackgroundJobStatus.Processing),
  startedProcessingAt: v.date(),
  finishedProcessingAt: v.null(),
});

const liteSucceededStatusEntries = () => ({
  status: v.literal(BackgroundJobStatus.Succeeded),
  startedProcessingAt: v.date(),
  finishedProcessingAt: v.date(),
});

const liteFailedStatusEntries = () => ({
  status: v.literal(BackgroundJobStatus.Failed),
  startedProcessingAt: v.date(),
  finishedProcessingAt: v.date(),
});

const processConversationEntries = () => ({
  id: backgroundJobId(),
  name: v.literal(BackgroundJobName.ProcessConversation),
  input: v.strictObject({
    id: conversationId(),
    inferenceOptions: inferenceOptions("completion"),
  }),
  enqueuedAt: v.date(),
});

const liteProcessConversationEntries = () => ({
  id: backgroundJobId(),
  name: v.literal(BackgroundJobName.ProcessConversation),
  enqueuedAt: v.date(),
});

export function backgroundJob(): v.GenericSchema<unknown, BackgroundJob> {
  return v.union([
    v.strictObject({
      ...processConversationEntries(),
      ...enqueuedStatusEntries(),
    }),
    v.strictObject({
      ...processConversationEntries(),
      ...processingStatusEntries(),
    }),
    v.strictObject({
      ...processConversationEntries(),
      ...succeededStatusEntries(),
    }),
    v.strictObject({
      ...processConversationEntries(),
      ...failedStatusEntries(),
    }),
  ]) as v.GenericSchema<unknown, BackgroundJob>;
}

export function liteBackgroundJob(): v.GenericSchema<
  unknown,
  LiteBackgroundJob
> {
  return v.union([
    v.strictObject({
      ...liteProcessConversationEntries(),
      ...liteEnqueuedStatusEntries(),
    }),
    v.strictObject({
      ...liteProcessConversationEntries(),
      ...liteProcessingStatusEntries(),
    }),
    v.strictObject({
      ...liteProcessConversationEntries(),
      ...liteSucceededStatusEntries(),
    }),
    v.strictObject({
      ...liteProcessConversationEntries(),
      ...liteFailedStatusEntries(),
    }),
  ]) as v.GenericSchema<unknown, LiteBackgroundJob>;
}
