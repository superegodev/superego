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
      const conversationJob = listJobsResult.data.find(
        ({ name, input }) =>
          name === BackgroundJobName.ProcessConversation &&
          (input as { id: ConversationId }).id === conversationId,
      );
      return (
        conversationJob?.status === BackgroundJobStatus.Succeeded ||
        conversationJob?.status === BackgroundJobStatus.Failed
      );
    },
    { interval: 5, timeout: 5_000 },
  );
}
