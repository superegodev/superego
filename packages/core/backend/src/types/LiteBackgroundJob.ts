import * as v from "valibot";
import BackgroundJobName from "../enums/BackgroundJobName.js";
import BackgroundJobStatus from "../enums/BackgroundJobStatus.js";
import BackgroundJobIdSchema from "../ids/BackgroundJobId.js";

// Mirrors BackgroundJob with `input` and `error` fields removed (per the
// existing `DistributiveOmit<BackgroundJob, "input" | "error">` definition).
function makeStatusVariants(nameLiteral: BackgroundJobName) {
  const baseEntries = {
    id: BackgroundJobIdSchema,
    name: v.literal(nameLiteral),
    enqueuedAt: v.date(),
  };
  return [
    v.object({
      ...baseEntries,
      status: v.literal(BackgroundJobStatus.Enqueued),
      startedProcessingAt: v.null(),
      finishedProcessingAt: v.null(),
    }),
    v.object({
      ...baseEntries,
      status: v.literal(BackgroundJobStatus.Processing),
      startedProcessingAt: v.date(),
      finishedProcessingAt: v.null(),
    }),
    v.object({
      ...baseEntries,
      status: v.literal(BackgroundJobStatus.Succeeded),
      startedProcessingAt: v.date(),
      finishedProcessingAt: v.date(),
    }),
    v.object({
      ...baseEntries,
      status: v.literal(BackgroundJobStatus.Failed),
      startedProcessingAt: v.date(),
      finishedProcessingAt: v.date(),
    }),
  ];
}

const LiteBackgroundJobSchema = v.union([
  ...makeStatusVariants(BackgroundJobName.ProcessConversation),
  ...makeStatusVariants(BackgroundJobName.DownSyncCollection),
]);
export default LiteBackgroundJobSchema;
export type LiteBackgroundJob = v.InferOutput<typeof LiteBackgroundJobSchema>;
