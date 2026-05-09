import * as v from "valibot";
import BackgroundJobName from "../enums/BackgroundJobName.js";
import BackgroundJobStatus from "../enums/BackgroundJobStatus.js";
import BackgroundJobIdSchema from "../ids/BackgroundJobId.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import ConversationIdSchema from "../ids/ConversationId.js";
import { InferenceOptionsCompletionSchema } from "./InferenceOptions.js";

const errorShape = v.object({ name: v.string(), details: v.any() });

const processConversationInputSchema = v.object({
  id: ConversationIdSchema,
  inferenceOptions: InferenceOptionsCompletionSchema,
});
const downSyncCollectionInputSchema = v.object({ id: CollectionIdSchema });

function makeStatusVariants<InputSchema extends v.GenericSchema>(
  nameLiteral: BackgroundJobName,
  inputSchema: InputSchema,
) {
  const baseEntries = {
    id: BackgroundJobIdSchema,
    name: v.literal(nameLiteral),
    input: inputSchema,
    enqueuedAt: v.date(),
  };
  return [
    v.object({
      ...baseEntries,
      status: v.literal(BackgroundJobStatus.Enqueued),
      startedProcessingAt: v.null(),
      finishedProcessingAt: v.null(),
      error: v.null(),
    }),
    v.object({
      ...baseEntries,
      status: v.literal(BackgroundJobStatus.Processing),
      startedProcessingAt: v.date(),
      finishedProcessingAt: v.null(),
      error: v.null(),
    }),
    v.object({
      ...baseEntries,
      status: v.literal(BackgroundJobStatus.Succeeded),
      startedProcessingAt: v.date(),
      finishedProcessingAt: v.date(),
      error: v.null(),
    }),
    v.object({
      ...baseEntries,
      status: v.literal(BackgroundJobStatus.Failed),
      startedProcessingAt: v.date(),
      finishedProcessingAt: v.date(),
      error: errorShape,
    }),
  ];
}

const BackgroundJobSchema = v.union([
  ...makeStatusVariants(
    BackgroundJobName.ProcessConversation,
    processConversationInputSchema,
  ),
  ...makeStatusVariants(
    BackgroundJobName.DownSyncCollection,
    downSyncCollectionInputSchema,
  ),
]);
export default BackgroundJobSchema;

type BackgroundJob = v.InferOutput<typeof BackgroundJobSchema>;

namespace BackgroundJob {
  export type ProcessConversation = Extract<
    BackgroundJob,
    { name: BackgroundJobName.ProcessConversation }
  >;
  export type DownSyncCollection = Extract<
    BackgroundJob,
    { name: BackgroundJobName.DownSyncCollection }
  >;
}
export type { BackgroundJob };
