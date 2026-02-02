import {
  type Backend,
  BackgroundJobName,
  BackgroundJobStatus,
  type ConversationId,
} from "@superego/backend";
import { assert, vi } from "vitest";

export default async function waitForConversationProcessing(
  backend: Backend,
  conversationId: ConversationId,
) {
  await vi.waitUntil(
    async () => {
      const listJobsResult = await backend.backgroundJobs.list();
      assert.isTrue(listJobsResult.success);
      const matchingJobs = listJobsResult.data.filter(
        ({ name }) => name === BackgroundJobName.ProcessConversation,
      );
      const resolvedJobs = await Promise.all(
        matchingJobs.map(async (job) => {
          const getJobResult = await backend.backgroundJobs.get(job.id);
          assert.isTrue(getJobResult.success);
          return getJobResult.data;
        }),
      );
      const conversationJob = resolvedJobs.find(
        ({ input }) => input.id === conversationId,
      );
      return (
        conversationJob?.status === BackgroundJobStatus.Succeeded ||
        conversationJob?.status === BackgroundJobStatus.Failed
      );
    },
    { interval: 5, timeout: 5_000 },
  );
}
