import {
  type BackgroundJob,
  BackgroundJobName,
  BackgroundJobStatus,
  type LiteBackgroundJob,
} from "@superego/backend";
import * as v from "valibot";
import {
  backgroundJobId,
  collectionId,
  conversationId,
} from "../helpers/idSchemas.js";
import { inferenceOptions } from "./inference.js";

const resultErrorRecord = () =>
  v.looseObject({ name: v.string(), details: v.any() });

const enqueuedDiscriminator = () =>
  v.looseObject({
    status: v.literal(BackgroundJobStatus.Enqueued),
    startedProcessingAt: v.null(),
    finishedProcessingAt: v.null(),
    error: v.null(),
  });

const processingDiscriminator = () =>
  v.looseObject({
    status: v.literal(BackgroundJobStatus.Processing),
    startedProcessingAt: v.date(),
    finishedProcessingAt: v.null(),
    error: v.null(),
  });

const succeededDiscriminator = () =>
  v.looseObject({
    status: v.literal(BackgroundJobStatus.Succeeded),
    startedProcessingAt: v.date(),
    finishedProcessingAt: v.date(),
    error: v.null(),
  });

const failedDiscriminator = () =>
  v.looseObject({
    status: v.literal(BackgroundJobStatus.Failed),
    startedProcessingAt: v.date(),
    finishedProcessingAt: v.date(),
    error: resultErrorRecord(),
  });

const liteEnqueuedDiscriminator = () =>
  v.looseObject({
    status: v.literal(BackgroundJobStatus.Enqueued),
    startedProcessingAt: v.null(),
    finishedProcessingAt: v.null(),
  });

const liteProcessingDiscriminator = () =>
  v.looseObject({
    status: v.literal(BackgroundJobStatus.Processing),
    startedProcessingAt: v.date(),
    finishedProcessingAt: v.null(),
  });

const liteSucceededDiscriminator = () =>
  v.looseObject({
    status: v.literal(BackgroundJobStatus.Succeeded),
    startedProcessingAt: v.date(),
    finishedProcessingAt: v.date(),
  });

const liteFailedDiscriminator = () =>
  v.looseObject({
    status: v.literal(BackgroundJobStatus.Failed),
    startedProcessingAt: v.date(),
    finishedProcessingAt: v.date(),
  });

const statusDiscriminator = () =>
  v.union([
    enqueuedDiscriminator(),
    processingDiscriminator(),
    succeededDiscriminator(),
    failedDiscriminator(),
  ]);

const liteStatusDiscriminator = () =>
  v.union([
    liteEnqueuedDiscriminator(),
    liteProcessingDiscriminator(),
    liteSucceededDiscriminator(),
    liteFailedDiscriminator(),
  ]);

const processConversationBase = () =>
  v.looseObject({
    id: backgroundJobId(),
    name: v.literal(BackgroundJobName.ProcessConversation),
    input: v.looseObject({
      id: conversationId(),
      inferenceOptions: inferenceOptions("completion"),
    }),
    enqueuedAt: v.date(),
  });

const downSyncCollectionBase = () =>
  v.looseObject({
    id: backgroundJobId(),
    name: v.literal(BackgroundJobName.DownSyncCollection),
    input: v.looseObject({ id: collectionId() }),
    enqueuedAt: v.date(),
  });

const liteProcessConversationBase = () =>
  v.looseObject({
    id: backgroundJobId(),
    name: v.literal(BackgroundJobName.ProcessConversation),
    enqueuedAt: v.date(),
  });

const liteDownSyncCollectionBase = () =>
  v.looseObject({
    id: backgroundJobId(),
    name: v.literal(BackgroundJobName.DownSyncCollection),
    enqueuedAt: v.date(),
  });

export function backgroundJob(): v.GenericSchema<unknown, BackgroundJob> {
  return v.union([
    v.intersect([processConversationBase(), statusDiscriminator()]),
    v.intersect([downSyncCollectionBase(), statusDiscriminator()]),
  ]) as v.GenericSchema<unknown, BackgroundJob>;
}

export function liteBackgroundJob(): v.GenericSchema<
  unknown,
  LiteBackgroundJob
> {
  return v.union([
    v.intersect([liteProcessConversationBase(), liteStatusDiscriminator()]),
    v.intersect([liteDownSyncCollectionBase(), liteStatusDiscriminator()]),
  ]) as v.GenericSchema<unknown, LiteBackgroundJob>;
}
